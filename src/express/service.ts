
import { Server } from 'http';
import { Release, Service } from '../decorators/service';
import { Aws, Express } from '../import';
import { Context } from '../types/core';
import { HttpRequest, HttpResponse } from '../types/http';

@Service(false)
export abstract class ExpressService {

  private server: Server;

  protected async process(ctx: Context, req: HttpRequest): Promise<HttpResponse> {
    let rsrc = req.resource;
    if (rsrc.indexOf('{') > 0) rsrc = rsrc.substring(0, rsrc.indexOf('{') - 1);
    req.path = req.path.substring(req.path.indexOf(rsrc));

    const app: Express.Express = Express.Create();
    // app.use(bodyParser.json());
    // app.use(awsServerlessExpressMiddleware.eventContext());

    this.setup(app, ctx, req);

    // TODO: Complete response
    return new Promise<HttpResponse>((resolve, reject) => {
      this.server = Aws.ServerlessExpress.createServer(app);
      Aws.ServerlessExpress.proxy(this.server, req, {
        succeed: (input: any) => resolve({
          statusCode: input.statusCode,
          headers: input.headers,
          body: input.body,
        }),
        fail: (err: any) => reject(err),
      } as any);
    });
  }

  protected abstract setup(app: Express.Express, ctx: Context, req: HttpRequest): void;

  @Release()
  public async release(): Promise<void> {
    if (this.server) this.server.close();
    this.server = undefined;
  }
}
