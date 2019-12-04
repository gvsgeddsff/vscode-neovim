import { NeovimClient } from "neovim";
import vscode from "vscode";

import {
    attachTestNvimClient,
    closeNvimClient,
    closeAllActiveEditors,
    wait,
    sendVSCodeKeys,
    assertContent,
    sendEscapeKey,
} from "../utils";

describe("Macros", () => {
    let client: NeovimClient;

    before(async () => {
        client = await attachTestNvimClient();
    });
    after(async () => {
        await closeNvimClient(client);
    });

    afterEach(async () => {
        await closeAllActiveEditors();
    });

    it("Macros works", async () => {
        const doc = await vscode.workspace.openTextDocument({
            content: ["a1", "b2", "c3"].join("\n"),
        });
        await vscode.window.showTextDocument(doc);
        await wait();

        await sendVSCodeKeys("qa");
        await sendVSCodeKeys("0xj");
        await sendVSCodeKeys("q");

        await assertContent(
            {
                content: ["1", "b2", "c3"],
            },
            client,
        );

        await sendVSCodeKeys("2@a");
        await assertContent(
            {
                content: ["1", "2", "3"],
            },
            client,
        );
    });

    it("Macros with insert mode", async () => {
        const doc = await vscode.workspace.openTextDocument({
            content: ["a", "b", "c"].join("\n"),
        });
        await vscode.window.showTextDocument(doc);
        await wait();

        await sendVSCodeKeys("qa");
        await sendVSCodeKeys("A1");
        await sendEscapeKey();
        await sendVSCodeKeys("j");
        await sendVSCodeKeys("q");

        await assertContent(
            {
                content: ["a1", "b", "c"],
            },
            client,
        );

        await sendVSCodeKeys("2@a");
        await assertContent(
            {
                content: ["a1", "b1", "c1"],
            },
            client,
        );
    });
});