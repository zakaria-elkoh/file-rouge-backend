import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);

export const IsAdmin = () => SetMetadata('isAdmin', true);
