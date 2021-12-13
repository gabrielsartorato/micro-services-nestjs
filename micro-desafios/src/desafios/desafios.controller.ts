import { Controller, Injectable, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DesafiosService } from './desafios.service';
import { Desafio } from './interfaces/desafio.interface';

const ackErrors: string[] = ['E11000'];

@Controller('desafios')
@Injectable()
export class DesafiosController {
  constructor(private readonly desafioService: DesafiosService) {}

  private logger = new Logger(DesafiosController.name);

  @EventPattern('criar-desafio')
  async criarDesafio(@Payload() desafio: Desafio, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.desafioService.criarDesafio(desafio);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      const filterAckerror = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckerror) {
        await channel.ack(originalMsg);
      }
    }
  }

  @MessagePattern('consultar-desafios')
  async consultarDesafios(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      if (data.idDesafio) {
        const desafio = await this.desafioService.consultarDesafioPorId(
          data.idDesafio,
        );
        return desafio;
      } else if (data.idJogador) {
        return await this.desafioService.consultarDesafiosDeUmJogador(
          data.idJogador,
        );
      } else {
        return await this.desafioService.consultarTodosDesafio();
      }
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('atualizar-desafio')
  async atualizarDesafio(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const _id: string = data.idDesafio;
      const desafio: Desafio = data.desafio;
      await this.desafioService.atualizarDesafio(_id, desafio);
      await channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(`error: ${JSON.stringify(err.message)}`);

      const filterAckerror = ackErrors.filter((ackError) =>
        err.message.includes(ackError),
      );

      if (filterAckerror) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('deletar-desafio')
  async deletarDesafio(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.desafioService.deletarDesafio(_id);
      await channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(`error: ${JSON.stringify(err.message)}`);

      const filterAckerror = ackErrors.filter((ackError) =>
        err.message.includes(ackError),
      );

      if (filterAckerror) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('atualizar-desafio-partida')
  async atualizarDesafioPartida(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const idPartida: string = data.idPartida;
      const desafio: Desafio = data.deesafio;

      await this.desafioService.atualizarDesafioPartida(idPartida, desafio);
      await channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(`error: ${JSON.stringify(err.message)}`);

      const filterAckerror = ackErrors.filter((ackError) =>
        err.message.includes(ackError),
      );

      if (filterAckerror) {
        await channel.ack(originalMsg);
      }
    }
  }
}
