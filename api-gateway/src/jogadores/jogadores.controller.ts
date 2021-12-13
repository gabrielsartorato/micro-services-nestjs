import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { Observable } from 'rxjs';
import { AwsService } from 'src/aws/aws.service';
import { Clientproxy } from 'src/clientproxy/clientproxy';
import { AtualizarJogadorDto } from './dtos/atualizar-jogador.dto';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';

@Controller('/api/v1/jogadores')
export class JogadoresController {
  private logger = new Logger(JogadoresController.name);
  constructor(
    private readonly clientProxy: Clientproxy,
    private readonly awsService: AwsService,
  ) {}

  @Post()
  @UsePipes(ValidationPipe)
  async criarJogador(@Body() criarJogadorDto: CriarJogadorDto) {
    const _id = criarJogadorDto.categoria;

    const categoria = await this.clientProxy
      .createQueue('admin-backend')
      .send('consultar-categorias', _id)
      .toPromise();

    if (!categoria) {
      throw new BadRequestException('Categoria não existente');
    }

    this.clientProxy
      .createQueue('admin-backend')
      .emit('criar-jogador', criarJogadorDto);
  }

  @Post('/:_id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadArquivo(@UploadedFile() file, @Param('_id') _id: string) {
    const jogador = await this.clientProxy
      .createQueue('admin-backend')
      .send('consultar-jogadores', _id)
      .toPromise();

    if (!jogador) {
      throw new BadRequestException(`Jogador não encontrado`);
    }

    const urlFotoJogador = await this.awsService.uploadArquivo(file, _id);

    const atualizarJogadorDto: AtualizarJogadorDto = {
      urlFotoJogador: urlFotoJogador.url,
    };

    await this.clientProxy
      .createQueue('admin-backend')
      .emit('atualizar-jogador', {
        _id,
        jogador: atualizarJogadorDto,
      });

    return this.clientProxy
      .createQueue('admin-backend')
      .send('consultar-jogadores', '_id');
  }

  @Get()
  consultarJogadores(@Query('idJogador') _id: string): Observable<any> {
    return this.clientProxy
      .createQueue('admin-backend')
      .send('consultar-jogadores', _id ? _id : '');
  }

  @Put('/:_id')
  async atualizarJogador(
    @Body() atualizarJogadorDto: AtualizarJogadorDto,
    @Param('_id') _id: string,
  ) {
    const categoria = await this.clientProxy
      .createQueue('admin-backend')
      .send('consultar-categorias', atualizarJogadorDto.categoria)
      .toPromise();

    if (!categoria) {
      throw new BadRequestException('Categoria não existente');
    }

    return this.clientProxy
      .createQueue('admin-backend')
      .emit('atualizar-jogador', {
        _id,
        atualizarJogadorDto,
      });
  }

  @Delete('/:_id')
  deletarJogador(@Param('_id') _id: string) {
    return this.clientProxy
      .createQueue('adming-backend')
      .emit('deletar-jogador', _id);
  }
}
