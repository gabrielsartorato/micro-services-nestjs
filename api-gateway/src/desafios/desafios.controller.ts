import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Clientproxy } from 'src/clientproxy/clientproxy';
import { Jogador } from 'src/jogadores/interfaces/jogador.interface';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.interface';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { DesafioStatus } from './dtos/desafio-status.enum';
import { Desafio } from './interfaces/desafio.interface';
import { DesafioStatusValidationPipe } from './pipes/desafio-status-validation.pipe';

@Controller('/api/v1/desafios')
export class DesafiosController {
  constructor(private readonly clientProxy: Clientproxy) {}

  @Post()
  @UsePipes(ValidationPipe)
  async criarDesafio(@Body() criarDesafioDto: CriarDesafioDto) {
    const { jogadores, categoria, solicitante } = criarDesafioDto;

    const jogadoresBanco: Jogador[] = await this.clientProxy
      .createQueue('admin-backend')
      .send('consultar-jogadores', '')
      .toPromise();

    const jogadoresPartida = jogadoresBanco.filter((jogadorB) =>
      jogadores.find((jogador) => {
        return jogador._id === jogadorB._id;
      }),
    );

    if (jogadoresPartida.length < 2) {
      throw new BadRequestException('Jogadores informados não cadastrados');
    }

    const categoriasBanco = await this.clientProxy
      .createQueue('admin-backend')
      .send('consultar-categorias', '')
      .toPromise();

    const verificarCategoriaExist = categoriasBanco.find(
      (categoriaBanco) => categoriaBanco._id === categoria,
    );

    if (!verificarCategoriaExist) {
      throw new BadRequestException('Categoria informada não existe');
    }

    for (const jogador of jogadoresPartida) {
      if (jogador.categoria !== categoria) {
        throw new BadRequestException(
          'Categoria informada não é igual a dos jogadores',
        );
      }
    }

    const verificarSesolicitanteEJogador = jogadoresPartida.find((jogador) => {
      return jogador._id === solicitante;
    });

    if (!verificarSesolicitanteEJogador) {
      throw new BadRequestException('Solicitante não faz parte do jogo');
    }

    this.clientProxy
      .createQueue('micro-desafios')
      .emit('criar-desafio', criarDesafioDto);
  }

  @Get()
  async consultarDesafio(
    @Query('idDesafio') idDesafio: string,
    @Query('idJogador') idJogador: string,
  ) {
    const jogadores = await this.clientProxy
      .createQueue('admin-backend')
      .send('consultar-jogadores', idJogador ? idJogador : '')
      .toPromise();

    if (idJogador && !jogadores) {
      throw new BadRequestException('Jogador não cadastrado na base de dados');
    }

    return this.clientProxy
      .createQueue('micro-desafios')
      .send(
        'consultar-desafios',
        idDesafio ? idDesafio : idJogador ? idJogador : '',
      );
  }

  @Put('/:_id')
  async alterarDesafio(
    @Body(DesafioStatusValidationPipe) atualizarDesafioDto: AtualizarDesafioDto,
    @Param('_id') idDesafio: string,
  ) {
    const verificarSeDesafioExiste: Desafio = await this.clientProxy
      .createQueue('micro-desafios')
      .send('consultar-desafios', { idDesafio })
      .toPromise();

    if (!verificarSeDesafioExiste) {
      throw new BadRequestException('Desafio não cadastrado');
    }

    if (verificarSeDesafioExiste.status !== DesafioStatus.PENDENTE) {
      throw new BadRequestException(
        'Somente desafios pendentes podem ser alterados',
      );
    }

    verificarSeDesafioExiste.status = atualizarDesafioDto.status;

    this.clientProxy.createQueue('micro-desafios').emit('atualizar-desafio', {
      idDesafio,
      desafio: verificarSeDesafioExiste,
    });
  }

  @Delete('/:_id')
  async deletarDesafio(@Param('_id') _id: string) {
    const desafio = await this.clientProxy
      .createQueue('micro-desafios')
      .send('consultar-desafios', { idDesafio: _id })
      .toPromise();

    if (!desafio) {
      throw new BadRequestException('Desafio não cadastrado');
    }

    this.clientProxy.createQueue('micro-desafios').emit('deletar-desafio', _id);
  }

  @Post('/:desafio/partida')
  async atribuitDesafioPartida(
    @Param('desafio') _id: string,
    @Body() atribuirDesafioDto: AtribuirDesafioPartidaDto,
  ) {
    const { def } = atribuirDesafioDto;

    const desafio = await this.clientProxy
      .createQueue('micro-desafios')
      .send('consultar-desafios', { idDesafio: _id })
      .toPromise();

    if (!desafio) {
      throw new BadRequestException('Desafio não cadastrado');
    }

    if (desafio.status === DesafioStatus.REALIZADO) {
      throw new BadRequestException(
        'Desafio que já foram realizados não podem ser atualizados',
      );
    }

    if (desafio.status !== DesafioStatus.ACEITO) {
      throw new BadRequestException(
        'Somente Desafios aceitos podem ser atribuidos partidas',
      );
    }

    const vencedorEhJogadorDesafio = desafio.jogadores.find(
      (jogador) => jogador._id === def._id,
    );

    if (!vencedorEhJogadorDesafio) {
      throw new BadRequestException(
        'Vencedor do desafio não está atribuido a partida',
      );
    }

    const data = {
      _id,
      atribuirDesafioDto,
    };

    this.clientProxy
      .createQueue('micro-desafios')
      .emit('atribuir-desafios', data);
  }
}
