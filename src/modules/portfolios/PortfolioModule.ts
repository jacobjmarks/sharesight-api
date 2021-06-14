import { InterfaceContext } from "../../SharesightApiInterface";

export class PortfolioModule {
  private ctx: InterfaceContext;

  constructor(ctx: InterfaceContext) {
    this.ctx = ctx;
  }

  public async getPortfolios(): Promise<any> {
    const res = await this.ctx.agent.get<any>("/v2/portfolios.json");
    return res.data;
  }

  public async getPortfolio(id: string): Promise<any> {
    const res = await this.ctx.agent.get<any>(`/v2/portfolios/${id}.json`);
    return res.data;
  }
}
