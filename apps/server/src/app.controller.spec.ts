import { AppController } from "./app.controller.js";

describe("AppController", () => {
  it('should return "OK"', () => {
    expect(new AppController().getHealth()).toBe("OK");
  });
});
