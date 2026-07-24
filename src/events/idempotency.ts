/**
 * Controle de idempotência por `event_id`.
 *
 * O produtor reenvia em caso de falha (integration-contract.md §6), então o mesmo
 * evento chega mais de uma vez. Sem esta trava, uma retentativa vira mensagem
 * duplicada para o cliente.
 *
 * A janela de 7 dias cobre qualquer retentativa realista e mantém o armazenamento
 * pequeno — ver docs/commercial-ai/lgpd-retencao.md.
 */

export const DEDUPLICATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export interface IdempotencyStore {
  /** Registra o id. Devolve `false` se já existia (ou seja, é duplicata). */
  register(eventId: string, now: number): Promise<boolean> | boolean;
  /** Remove entradas expiradas. Devolve quantas foram removidas. */
  purge(now: number): Promise<number> | number;
}

/**
 * Implementação em memória — suficiente para testes e para um único processo.
 * Em produção o armazenamento é o do n8n/Redis; o contrato é o mesmo.
 */
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly seen = new Map<string, number>();

  constructor(private readonly windowMs: number = DEDUPLICATION_WINDOW_MS) {}

  register(eventId: string, now: number = Date.now()): boolean {
    const previous = this.seen.get(eventId);
    if (previous !== undefined && now - previous < this.windowMs) {
      return false;
    }
    this.seen.set(eventId, now);
    return true;
  }

  purge(now: number = Date.now()): number {
    let removed = 0;
    for (const [id, at] of this.seen) {
      if (now - at >= this.windowMs) {
        this.seen.delete(id);
        removed += 1;
      }
    }
    return removed;
  }

  get size(): number {
    return this.seen.size;
  }
}
