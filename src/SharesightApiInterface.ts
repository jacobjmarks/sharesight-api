import axios, { AxiosInstance } from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
import { JSDOM } from "jsdom";
import * as qs from "qs";
import { CookieJar } from "tough-cookie";
import { SHARESIGHT_API_BASEURL } from "./config";

export interface InterfaceContext {
  agent: AxiosInstance;
}

export class SharesightApiInterface {
  protected ctx: InterfaceContext;

  constructor() {
    const agent = axios.create({ baseURL: SHARESIGHT_API_BASEURL, withCredentials: true });
    axiosCookieJarSupport(agent);
    agent.defaults.jar = new CookieJar();
    this.ctx = { agent };
  }

  public async login(username: string, password: string): Promise<SharesightApiInterface> {
    const LOGIN_PAGE = "https://portfolio.sharesight.com/users/sign_in";

    const { data: loginPageHtml } = await this.ctx.agent.get<string>(LOGIN_PAGE);
    const loginPageDoc = new JSDOM(loginPageHtml).window.document;
    const authTokenInput = loginPageDoc.querySelector<HTMLInputElement>("input[name=authenticity_token]");
    const authToken = authTokenInput.value;

    const loginResponse = await this.ctx.agent.post(
      LOGIN_PAGE,
      qs.stringify({
        authenticity_token: authToken,
        "user[email]": username,
        "user[password]": password,
        commit: "Log in",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        maxRedirects: 0,
        validateStatus: status => status === 302,
      }
    );

    if (!loginResponse.headers["authorization"]) {
      throw new Error("Authentication failed");
    }

    return this;
  }
}
