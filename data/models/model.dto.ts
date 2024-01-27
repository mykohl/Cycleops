import {
    Brand,
    BrandMember,
    Claim,
    Part, 
    PartType,
    ProductLine,
    PropertyType, 
    Property, 
    PropertyGroup,
    User,
    PartClass
} from "../prisma/client";

export type MakeNullable<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };
export type PrefixProperties<T, Prefix extends string> = { [K in keyof T as `${Prefix}${string & K}`]: T[K]; };

export type BrandDto = MakeNullable<Brand, "id">;
export type ProductLineDto = MakeNullable<ProductLine, "id"> & { brandMembers: BrandDto[] }

export type PartTypeDto = MakeNullable<PartType, "id">;
export type PartClassDto = MakeNullable<PartClass, "id"> & { partTypes: PartTypeDto };

export type PropertyDto = MakeNullable<Property, "id">;
export type PropertyTypeDto = MakeNullable<PropertyType, "id">
export type PropertyGroupDto = MakeNullable<PropertyGroup, "id"> & { properties?: PropertyDto[] };

export type PartDto = MakeNullable<Part, "id" > & { productLine: ProductLineDto };

export type UserDto = MakeOptional<User, 'id' | 'lastLogIn' | 'registered' | 'roles'>;

export type UserStatus = {
    actionTitle: string,
    actionColor: string,
    actionIcon: string
};