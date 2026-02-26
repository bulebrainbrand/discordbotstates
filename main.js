const getDiscordBotStates = async () => {
    const apiRootPath = "https://discord-bot-kyt2.onrender.com/api"
    const upTimePath = apiRootPath + "/uptime"
    const connectDbPath = apiRootPath + "/connectDb"
    return { upTime: await fetchData(upTimePath), connectDb: await fetchData(connectDbPath) }
}

const fetchData = async (path) => {
    const res = await fetch(path)
    if (res.ok) {
        return { ok: true, text: await res.text() }
    }
    else {
        return { ok: false, text: `${res.status} ${res.statusText}` }
    }
}

const changeCardStatus = (element, title, desc, status) => {
    console.log(element, title, desc, status)
}

const update = async () => {
    const data = await getDiscordBotStates()
    console.log(data)
}

update()