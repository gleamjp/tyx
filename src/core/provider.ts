import { Database } from '../decorators/database';
import { Activate, Inject, Service } from '../decorators/service';
import { TypeOrmProvider } from '../graphql/typeorm';
import { Orm } from '../import';
import { getConnection } from '../import/typeorm';
import { Logger } from '../logger';
import { DatabaseMetadata } from '../metadata/database';
import { EntityMetadata } from '../metadata/entity';
import { Configuration } from '../types/config';
import { Class } from '../types/core';

export { Connection, ConnectionOptions, EntityManager, Repository } from '../import/typeorm';

@Service(false)
export class DatabaseProvider extends TypeOrmProvider implements Database {

  @Inject(Configuration)
  public config: Configuration;

  public log = Logger.get(this);
  public label: string;

  protected connection: Orm.Connection;
  public manager: Orm.EntityManager;

  public get entities(): Class[] { return DatabaseMetadata.get(this).targets; }

  public get metadata(): EntityMetadata[] { return DatabaseMetadata.get(this).entities; }
  // { return this.connection.entityMetadatas as any; }

  public getMetadata(entity: string | Function): EntityMetadata {
    return this.connection.getMetadata(entity) as any;
  }

  @Activate()
  protected async activate() {
    if (!this.connection) {
      // TODO: Multiple connections, name from metadata
      this.connection = getConnection('tyx');
      this.manager = this.connection.manager;
    }
  }
}
