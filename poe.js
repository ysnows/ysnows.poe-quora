const url = 'https://www.quora.com/poe_api/gql_POST'

const headers = {
    'Host': 'www.quora.com',
    'Accept': '*/*',
    'apollographql-client-version': '1.1.6-65',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': 'Poe 1.1.6 rv:65 env:prod (iPhone14,2; iOS 16.2; en_US)',
    'apollographql-client-name': 'com.quora.app.Experts-apollo-ios',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
}

function setAuth(key, value) {
    headers[key] = value;
}

async function loadChatIdMap(bot = "a2") {
    const data = {
        operationName: 'ChatViewQuery',
        query: 'query ChatViewQuery($bot: String!) {\n  chatOfBot(bot: $bot) {\n    __typename\n    ...ChatFragment\n  }\n}\nfragment ChatFragment on Chat {\n  __typename\n  id\n  chatId\n  defaultBotNickname\n  shouldShowDisclaimer\n}',
        variables: {
            bot: bot
        }
    };

    const response = await $http.request(url, {
        method: 'POST',
        header: headers,
        body: data
    });

    const responseJson = await response.json();
    if (responseJson.errors) {
        return {error: responseJson.errors[0].message};
    }
    return responseJson.data.chatOfBot.chatId;
}

async function sendMessage(message, bot = "a2", chatId = "") {
    const data = {
        operationName: "AddHumanMessageMutation",
        query: "mutation AddHumanMessageMutation($chatId: BigInt!, $bot: String!, $query: String!, $source: MessageSource, $withChatBreak: Boolean! = false) {\n  messageCreate(\n    chatId: $chatId\n    bot: $bot\n    query: $query\n    source: $source\n    withChatBreak: $withChatBreak\n  ) {\n    __typename\n    message {\n      __typename\n      ...MessageFragment\n      chat {\n        __typename\n        id\n        shouldShowDisclaimer\n      }\n    }\n    chatBreak {\n      __typename\n      ...MessageFragment\n    }\n  }\n}\nfragment MessageFragment on Message {\n  id\n  __typename\n  messageId\n  text\n  linkifiedText\n  authorNickname\n  state\n  vote\n  voteReason\n  creationTime\n  suggestedReplies\n}",
        variables: {
            "bot": bot,
            "chatId": chatId,
            "query": message,
            "source": null,
            "withChatBreak": false
        }
    };

    await $http.request(url, {
        method: 'POST',
        header: headers,
        body: data
    });
}

async function clearContext(chatId) {
    const data = {
        operationName: "AddMessageBreakMutation",
        query: "mutation AddMessageBreakMutation($chatId: BigInt!) {\n  messageBreakCreate(chatId: $chatId) {\n    __typename\n    message {\n      __typename\n      ...MessageFragment\n    }\n  }\n}\nfragment MessageFragment on Message {\n  id\n  __typename\n  messageId\n  text\n  linkifiedText\n  authorNickname\n  state\n  vote\n  voteReason\n  creationTime\n  suggestedReplies\n}",
        variables: {
            chatId: chatId
        }
    };

    await $http.request(url, {
        method: 'POST',
        header: headers,
        body: data
    });
}

async function getLatestMessage(bot) {
    const data = {
        operationName: "ChatPaginationQuery",
        query: "query ChatPaginationQuery($bot: String!, $before: String, $last: Int! = 10) {\n  chatOfBot(bot: $bot) {\n    id\n    __typename\n    messagesConnection(before: $before, last: $last) {\n      __typename\n      pageInfo {\n        __typename\n        hasPreviousPage\n      }\n      edges {\n        __typename\n        node {\n          __typename\n          ...MessageFragment\n        }\n      }\n    }\n  }\n}\nfragment MessageFragment on Message {\n  id\n  __typename\n  messageId\n  text\n  linkifiedText\n  authorNickname\n  state\n  vote\n  voteReason\n  creationTime\n}",
        variables: {
            before: null,
            bot: bot,
            last: 1
        }
    };

    let authorNickname = "";
    let state = "incomplete";

    var text = "";
    console.log("hello: Waiting for response..." + bot);
    while (true) {

        try {

            console.log("hello: Waiting for response...1");
            // await new Promise(resolve => setTimeout(resolve, 2));

            const response = await $http.request(url, {
                method: 'POST',
                header: headers,
                body: data
            });

            console.log("hello: Waiting for response...2" + response.statusText);
            const responseJson = await response.json();

            console.log("hello: Waiting for response...3" + JSON.stringify(responseJson));
            if (responseJson.errors) {
                text = responseJson.errors[0].message
                break
            }

            const edges = responseJson.data.chatOfBot.messagesConnection.edges;
            const node = edges[edges.length - 1].node;
            text = node.text;
            const state = node.state;
            const authorNickname = node.authorNickname;
            console.log(`hello: Waiting for response...3 state: ${state} authorNickname: ${authorNickname} text: ${text}`);
            if (authorNickname === bot && state === 'complete') {
                break;
            }

        } catch (e) {
            text = e.message
            break
        }
    }

    return text;
}

exports.setAuth = setAuth;
exports.loadChatIdMap = loadChatIdMap;
exports.sendMessage = sendMessage;
exports.clearContext = clearContext;
exports.getLatestMessage = getLatestMessage;
