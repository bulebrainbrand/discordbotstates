const getDiscordBotStates = async () => {
    const apiRootPath = "https://discord-bot-kyt2.onrender.com/api"
    const upTimePath = apiRootPath + "/uptime"
    const connectDbPath = apiRootPath + "/connectDb"
    return { upTime: await fetchData(upTimePath, true), connectDb: await fetchData(connectDbPath, false) }
}

const fetchData = async (path, isText) => {
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 5000)
    try {
        const res = await fetch(path, { signal: abortController.signal })
        clearTimeout(timeoutId)
        if (res.ok) {
            return { ok: true, text: isText ? await res.text() : await res.json() }
        }
        else {
            return { ok: false, text: `${res.status} ${res.statusText}` }
        }
    }
    catch (e) {
        if (e.name === "AbortError") return { ok: false, text: "timeout" };
        return { ok: false, text: e.message }
    }
}



const update = async () => {
    runningBot.toPending()
    uptime.toPending()
    databaseSize.toPending()
    databaseConnect.toPending()
    const data = await getDiscordBotStates()
    runningBot.showResult(data.upTime)
    uptime.showResult(data.upTime)
    databaseSize.showResult(data.connectDb)
    databaseConnect.showResult(data.connectDb)
}

const ResultCard = class {
    constructor(element, showResult, toPending) {
        this.element = element
        this.showResult = showResult
        if (toPending) this.toPending = toPending
    }
    toPending() {
        this.changeCardStatus({
            desc: "読み込んでいます",
            status: "pending"
        })
    }
    changeCardStatus({ main, desc, status, ok, onOkStatus = "success", onNotOkStatus = "failed", onOkDesc, onNotOkDesc, onOkMain = "success", onNotOkMain = "failed", text, timeoutMain = "timeout", timeoutDesc = "接続に時間がかかりすぎたので中止しました" }) {
        const mainEle = this.element.querySelector(".main-text")
        const descEle = this.element.querySelector(".description")
        let showStatus = status
        let showDesc = desc
        let showMain = main
        if (ok === true) {
            showStatus ??= onOkStatus
            showDesc ??= onOkDesc
            showMain ??= onOkMain
        }
        else if (ok === false) {
            if (text === "timeout") {
                showDesc ??= timeoutDesc
                showMain ??= timeoutMain
                showStatus ??= onNotOkStatus
            }
            else {
                showStatus ??= onNotOkStatus
                showDesc ??= onNotOkDesc
                showMain ??= onNotOkMain
            }
        }
        if (showMain) mainEle.textContent = showMain
        if (showDesc) descEle.textContent = showDesc
        if (showStatus) {
            this.element.classList.remove("success", "pending", "failed")
            this.element.classList.add(showStatus)
        }
    }
}

const runningBot = new ResultCard(
    document.getElementById("running-bot"),
    function ({ ok, text }) {
        this.changeCardStatus({
            ok,
            text,
            onOkDesc: "ボットは稼働中です",
            onNotOkDesc: "ボットは停止中です...",
        })
    })

const uptime = new ResultCard(
    document.getElementById("uptime"),
    function ({ ok, text }) {
        this.changeCardStatus({
            ok,
            text,
            onOkDesc: "ボットの稼働開始時刻を示します",
            onNotOkDesc: "ボットの稼働開始時刻の取得に失敗しました",
            onOkMain: new Date(Number(text)).toLocaleString(),
        })
    })

const databaseConnect = new ResultCard(
    document.getElementById("database-connect"),
    function ({ ok, text }) {
        this.changeCardStatus({
            ok: ok && text.success,
            text,
            onOkDesc: "データベースに正常に接続しています",
            onNotOkDesc: ok ? "サーバーは稼働していますが、データベースには接続されていないようです" : "サーバーが稼働していないか、一時的に取得に失敗しています",
            onOkMain: "success",
        })
    }
)

const databaseSize = new ResultCard(
    document.getElementById("database-size"),
    function ({ ok, text }) {
        this.changeCardStatus({
            ok: ok && text.success,
            text,
            onOkDesc: "データベースのサイズです。マックス512MBです",
            onNotOkDesc: "取得に失敗しました",
            onOkMain: `${text?.megaByte}MB`,
        })
    }
)

update()
