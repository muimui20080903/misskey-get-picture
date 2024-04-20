const main = async () => {

    // 設定の読み込み
    const config = await JSON.parse(Deno.readTextFileSync("config.json"))
    const userList = config.userList // MisskeyのユーザーIDのリスト
    const i = config.i // MisskeyのAPIキー
    const noteList: string[] = []

    // ユーザーごとにノートを取得
    for await (const user of userList) {
        const notes: string[] = await getNote(user, i)
        noteList.push(...notes)
    }

    // ノートをDiscordに送信
    noteList.forEach(note => {
        sendDiscord(note)
    })

}

const getNote = async (userId: string, i: string): Promise<string[]> => {
    const requestUrl = "https://misskey.io/api/users/notes" // ioの部分はMisskeyのインスタンスによって変わる

    // APIリクエストを送信
    const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "i": i,
        },
        body: JSON.stringify({
            userId: userId,
            limit: 100,
        }),
    })

    const responseBody = await response.text()
    const responseJson = JSON.parse(responseBody)
    // ユーザーのノートのうち、ファイルを含むもののURLを取得
    const notes = responseJson.filter(note => note.user.id === userId)
        .map(note => note.files)
        .filter(file => file.length > 0)
        .flatMap(files => files.map(file => file.url))

    return notes
}

const sendDiscord = (note: string) => {
    console.log(note)
}

main()
