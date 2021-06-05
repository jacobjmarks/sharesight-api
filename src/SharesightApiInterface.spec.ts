import axios, { AxiosResponse } from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
import { randomUUID } from "crypto";
import * as qs from "qs";
import { mocked } from "ts-jest/utils";
import { SharesightApiInterface } from "./SharesightApiInterface";

jest.mock("axios");
const mockedAxios = mocked(axios, true);
mockedAxios.create.mockImplementation(() => mockedAxios);

jest.mock("axios-cookiejar-support");
const mockedCookieJarSupport = mocked(axiosCookieJarSupport, true);
mockedCookieJarSupport.mockImplementation(() => mockedAxios);

describe("Sharesight API Interface", () => {
  let ss: SharesightApiInterface;

  beforeEach(() => {
    ss = new SharesightApiInterface();
  });

  describe("Login", () => {
    test("valid credentials", async () => {
      const headerToken = `HEAD_TOKEN_${randomUUID()}`;
      const bodyToken = `BODY_TOKEN_${randomUUID()}`;

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: `<html>
          <head>
            <meta name="csrf-param" content="authenticity_token" />
            <meta name="csrf-token" content="${headerToken}" />
          </head>
          <body>
            <input type="hidden" name="authenticity_token" value="${bodyToken}" />
          </body>
        </html>`,
      } as AxiosResponse<string>);

      mockedAxios.post.mockResolvedValueOnce({
        status: 302,
        statusText: "FOUND",
        headers: { authorization: "Bearer token" },
      } as AxiosResponse);

      const username = "testuser-email";
      const password = "testuser-password";

      await ss.login(username, password);

      const expectedRequest = {
        config: { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
        data: qs.stringify({
          authenticity_token: bodyToken,
          "user[email]": username,
          "user[password]": password,
          commit: "Log in",
        }),
      };

      expect(mockedAxios.post).toHaveBeenLastCalledWith(
        expect.any(String),
        expectedRequest.data,
        expect.objectContaining(expectedRequest.config)
      );
    });

    test("invalid credentials", async () => {
      const headerToken = `HEAD_TOKEN_${randomUUID()}`;
      const bodyToken = `BODY_TOKEN_${randomUUID()}`;

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        data: `<html>
          <head>
            <meta name="csrf-param" content="authenticity_token" />
            <meta name="csrf-token" content="${headerToken}" />
          </head>
          <body>
            <input type="hidden" name="authenticity_token" value="${bodyToken}" />
          </body>
        </html>`,
      } as AxiosResponse<string>);

      mockedAxios.post.mockResolvedValueOnce({
        status: 302,
        statusText: "FOUND",
        headers: {},
      } as AxiosResponse);

      const username = "testuser-email";
      const password = "INVALID_PASSWORD";

      await expect(ss.login(username, password)).rejects.toThrowError("Authentication failed");

      const expectedRequest = {
        config: { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
        data: qs.stringify({
          authenticity_token: bodyToken,
          "user[email]": username,
          "user[password]": password,
          commit: "Log in",
        }),
      };

      expect(mockedAxios.post).toHaveBeenLastCalledWith(
        expect.any(String),
        expectedRequest.data,
        expect.objectContaining(expectedRequest.config)
      );
    });
  });
});
