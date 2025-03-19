import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhotoSchema } from './photo.schema';
import { PhotosService } from './photos.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Photo', schema: PhotoSchema }]),
  ],
  providers: [PhotosService],
  exports: [PhotosService, MongooseModule],
})
export class PhotosModule {}
