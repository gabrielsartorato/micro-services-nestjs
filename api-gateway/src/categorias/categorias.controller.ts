import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { Clientproxy } from 'src/clientproxy/clientproxy';

import { AtualizarCategoriaDto } from './dtos/atualizar-categoria.dto';
import { CriarCategoriaDto } from './dtos/criar-categoria.dto';

@Controller('/api/v1/categorias')
export class CategoriasController {
  constructor(private readonly clientProxy: Clientproxy) {}

  @Post()
  @UsePipes(ValidationPipe)
  criarCategoria(@Body() criarCategoriaDto: CriarCategoriaDto) {
    this.clientProxy
      .createQueue('admin-backend')
      .emit('criar-categoria', criarCategoriaDto);
  }

  @Get()
  async consultarCategorias(
    @Query('idCategoria') _id: string,
  ): Promise<Observable<any>> {
    return this.clientProxy
      .createQueue('admin-backend')
      .send('consultar-categorias', _id ? _id : '');
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  atualizarCategoria(
    @Body() atualizarCategoriaDto: AtualizarCategoriaDto,
    @Param('_id') _id: string,
  ) {
    // Emit, torna o método um event emmiter
    this.clientProxy.createQueue('admin-backend').emit('atualizar-categoria', {
      id: _id,
      categoria: atualizarCategoriaDto,
    });
  }
}
