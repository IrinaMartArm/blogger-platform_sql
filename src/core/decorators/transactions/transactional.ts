import {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export class TransactionalRepository<T extends ObjectLiteral> {
  protected repo: Repository<T>;

  constructor(
    protected readonly dataSource: DataSource,
    entity: EntityTarget<T>,
    manager?: EntityManager,
  ) {
    this.repo = manager
      ? manager.getRepository(entity)
      : dataSource.getRepository(entity);
  }

  withTransaction<R extends this>(this: R, manager: EntityManager): R {
    // Создаём новый экземпляр того же класса
    const instance = Object.create(this) as R;

    instance.repo = manager.getRepository(this.repo.target);
    return instance;
  }

  async save(entity: T): Promise<void> {
    await this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
