/** @group integration */
import axios from "axios";
import { config as dotenv } from "dotenv";
import { JSDOM } from "jsdom";
import { SHARESIGHT_LOGIN_PAGE } from "./config";
import { SharesightApiInterface } from "./SharesightApiInterface";

dotenv();

const { SHARESIGHT_USERNAME, SHARESIGHT_PASSWORD } = process.env;

describe("Sharesight API Interface integration", () => {
  let ss: SharesightApiInterface;

  beforeEach(() => {
    ss = new SharesightApiInterface();
  });

  describe("Login", () => {
    test("Extract authenticity token", async () => {
      const res = await axios.get<string>(SHARESIGHT_LOGIN_PAGE);
      expect(res.status).toBe(200);
      expect(res.headers).toEqual(expect.objectContaining({ "content-type": expect.stringContaining("text/html") }));
      const document = new JSDOM(res.data).window.document;
      const input = document.querySelector<HTMLInputElement>("input[name=authenticity_token]");
      expect(input).toBeDefined();
      expect(input.value).toBeTruthy();
    });

    test("Login", async () => {
      await expect(ss.login(SHARESIGHT_USERNAME, SHARESIGHT_PASSWORD)).resolves.not.toThrow();
    });
  });
});
