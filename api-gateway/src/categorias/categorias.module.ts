import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller';
import { ClientproxyModule } from '../clientproxy/clientproxy.module';

@Module({
  controllers: [CategoriasController],
  imports: [ClientproxyModule],
}) 
export class CategoriasModule {}
