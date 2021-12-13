import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Desafio } from 'src/desafios/interfaces/desafio.interface';
import { ProxyrmqService } from 'src/proxyrmq/proxyrmq.service';
import { Partida } from './interfaces/partida.interface';

@Injectable()
export class PartidasService {
  private logger = new Logger(PartidasService.name);

  constructor(
    @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
    private readonly proxyRmq: ProxyrmqService,
  ) {}

  async criarPartida(partida: Partida): Promise<Partida> {
    try {
      const partidaCriada = new this.partidaModel(partida);
      this.logger.log(`partidaCriada: ${JSON.stringify(partidaCriada)}`);

      const result = await partidaCriada.save();

      const idPartida = result._id;

      console.log(result, idPartida);

      const desafio: Desafio = await this.proxyRmq
        .createQueue('micro-desafios')
        .send('consultar-desafios', {
          idJogador: '',
          idDesafio: partida.desafio,
        })
        .toPromise();

      return this.proxyRmq
        .createQueue('micro-desafios')
        .emit('atualizar-desafio-partida', {
          idPartida,
          desafio,
        })
        .toPromise();
    } catch (err) {
      this.logger.log(`Error: ${JSON.stringify(err.message)}`);
      throw new RpcException(err.message);
    }
  }
}
