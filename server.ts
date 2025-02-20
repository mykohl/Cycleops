import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import path from "path";
import fs from 'fs';
import https from 'https';
import adminRouter from './routes/admin.routes';
import { prisma } from './prisma.instance';

const envPath = path.join(__dirname, '.env');
const env = process.env.NODE_ENV || 'development';
const configFile = path.join(__dirname, 'config.json');
export const config = JSON.parse(fs.readFileSync(configFile, 'utf8'))[env];
dotenv.config({ path: envPath });

const app = express();
const httpsPort = 443;
const privateKey = fs.readFileSync('../certificates/localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('../certificates/localhost.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const setSecureCookies = (req: Request, res: Response, next: NextFunction) => {
  res.cookie('cycle-ops-app-cookie', config.JWT_SECRET, { sameSite: 'none', secure: true });
  next();
};

async function main() {
  app.use(setSecureCookies);
  app.use(express.json());
  app.use(express.static('cycle-ops-app/browser'));

  app.use((req, res, next) => {
    if(req.url.startsWith('/api')) {
      next();
    } else {
      res.sendFile(path.resolve('cycle-ops-app/browser/index.html'));
    }
  });

  app.use('/api/admin', adminRouter);

  app.use((req, res, next) => {
    if(req.secure) {
      next();
    } else {
      res.redirect(`https://${req.headers.host}${req.url}`);
    }
  });

  app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  const httpServer = express();
  httpServer.use((req, res) => {
    res.redirect(`https://${req.headers.host}${req.url}`);
  });

  await prisma.$connect();

  const httpsServer = https.createServer(credentials, app);

  httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS server listening on port ${httpsPort}`);
  });
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
