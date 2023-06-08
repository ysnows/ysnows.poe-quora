var poe = require('./poe');

function main(text, contextText, completion, streamHandler) {
    (async () => {
        try {
            $option.cookie = `m-b=${$option.mb}`
            // 将所有消息通过换行拼接起来
            
            $option.message = contextText.value.messages.map((item) => item.content).join(`
            
            `)

            $option.bot = $option.model

            if ($option.cookie === null || $option.formkey === null) {
                completion({
                    result: {
                        "type": "error",
                        "value": 'At least one of the headers is not provided. Please ensure both the formkey and cookie headers are set.',
                    },
                });
            }
            try {

                console.log("hello: " + JSON.stringify($option));

                poe.setAuth('Quora-Formkey', $option.formkey);
                poe.setAuth('Cookie', $option.cookie);

                const result = await poe.loadChatIdMap($option.bot);
                if (result.error) {
                    completion({
                        result: {
                            "type": "error",
                            "value": result.error,
                        },
                    });
                    return
                }
                const chatId = result;
                console.log("hello: " + chatId);

                // await media.clearContext(chatId);

                await poe.sendMessage($option.message, $option.bot, chatId);
                console.log("hello: 2" + chatId);

                const reply = await poe.getLatestMessage($option.bot);

                completion({
                    result: {
                        "type": "text",
                        "value": reply,
                    },
                });

            } catch (e) {
                console.error(e);
                completion({
                    result: {
                        "type": "error",
                        "value": 'Internal Server Error',
                    },
                });
            }
        } catch (e) {
            throw e;
        }
    })().catch((err) => {
        completion({
            result: {
                type: "error",
                value: JSON.parse(err).error.message || '未知错误',
            },
        });
    });
}
