import React, { useState } from "react"

export default function Chat(props) {
    const [showReceivers, setShowReceivers] = useState(false)
    const [chatContent, setChatContent] = useState("")
    const [checkReceiverId, setCheckReceiverId] = useState("all")

    const handleSendMessage = (message) => {
        if (checkReceiverId === "all")
            window.textRoomHelper.sendData(JSON.stringify({ type: "all", room: "textRoom", message: message, sender: props.query.name }))
        else window.textRoomHelper.sendPrivateMsg(props.query.name, checkReceiverId, message)
    }
    const handleClickReceiver = (id) => {
        setCheckReceiverId(id)
        setShowReceivers(!showReceivers)
    }
    return (
        <div id="wc-container-right" style={{ width: "400px" }}>
            <div className="chat-container">
                <div style={{ height: "89%" }}>
                    <div role="presentation" className="chat-header__header">
                        <div className="chat-header__title">Zoom Group Chat</div>
                    </div>
                    <div className="chat-container__chat-list" style={{ height: "95%" }}>
                        <div className="chat-content__chat-scrollbar" style={{ height: "100%" }}>
                            <div style={{ height: "100%" }}>
                                <div
                                    className="ReactVirtualized__Grid ReactVirtualized__List chat-virtualized-list ax-outline-blue"
                                    style={{ height: "100%" }}
                                >
                                    <div style={{ height: "100%" }} role="rowgroup">
                                        {props.chatState.contents.map((content, i) => {
                                            if (content.kind === "all")
                                                return (
                                                    <div role="presentation" key={i}>
                                                        <div role="presentation" className="chat-item__chat-info">
                                                            <div className="chat-item__chat-info-header">
                                                                <div className="chat-item__left-container">
                                                                    <span
                                                                        role="presentation"
                                                                        className="chat-item__sender chat-item__chat-info-header--can-select"
                                                                        title={content.sender}
                                                                    >
                                                                        {content.sender === props.query.name ? "Me" : content.sender}
                                                                    </span>
                                                                    <span className="chat-item__to"> To </span>
                                                                    <span className="chat-item__chat-info-header--can-select chat-item__chat-info-header--everyone">
                                                                        Everyone
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <pre className="chat-item__chat-info-msg">{content.message}</pre>
                                                        </div>
                                                    </div>
                                                )
                                            else {
                                                return (
                                                    <div role="presentation" key={i}>
                                                        <div role="presentation" className="chat-item__chat-info">
                                                            <div className="chat-item__chat-info-header">
                                                                <div className="chat-item__left-container">
                                                                    <span role="presentation" className="chat-item__sender" title="Me">
                                                                        {content.receiver ? "Me" : content.sender}
                                                                    </span>
                                                                    <span className="chat-item__to"> To </span>
                                                                    <span className="chat-item__chat-info-header--can-select">
                                                                        {content.receiver ? content.receiver : "Me"}
                                                                    </span>
                                                                    <span className="chat-privately" style={{ padding: "0px" }}>
                                                                        (Privately)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <pre className="chat-item__chat-info-msg">{content.message}</pre>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="chat-container__chat-control">
                        <div className="chat-receiver-list">
                            <span className="chat-receiver-list__to-text">To: </span>
                            <div
                                className={
                                    !showReceivers
                                        ? "chat-receiver-list__menu dropup btn-group"
                                        : "chat-receiver-list__menu open dropup btn-group"
                                }
                            >
                                <button
                                    id="chatReceiverMenu"
                                    aria-haspopup="true"
                                    aria-expanded={!showReceivers ? "false" : "true"}
                                    type="button"
                                    className="chat-receiver-list__receiver dropdown-toggle btn btn-default"
                                    onClick={() => setShowReceivers(!showReceivers)}
                                >
                                    {checkReceiverId === "all" ? "Everyone" : props.chatState.users[checkReceiverId]}
                                </button>
                                <ul role="menu" className="dropdown-menu" aria-labelledby="chatReceiverMenu">
                                    <section
                                        data-scrollbar="true"
                                        tabIndex="0"
                                        className="chat-receiver-list__scrollbar"
                                        style={{ overflow: "hidden" }}
                                    >
                                        <div className="scroll-content">
                                            <div>
                                                <li
                                                    className={
                                                        checkReceiverId === "all"
                                                            ? "chat-receiver-list__menu-item chat-receiver-list__menu-item--checked"
                                                            : "chat-receiver-list__menu-item"
                                                    }
                                                >
                                                    <button id="all" onClick={(e) => handleClickReceiver(e.target.id)}>
                                                        Everyone
                                                        <span
                                                            id="all"
                                                            className="chat-receiver-list__appendix"
                                                            onClick={(e) => handleClickReceiver(e.target.id)}
                                                        >
                                                            (in Meeting)
                                                        </span>
                                                    </button>
                                                </li>
                                                {Object.keys(props.chatState.users).map((val, k) => {
                                                    if (props.chatState.users[val] !== props.query.name)
                                                        return (
                                                            <li
                                                                key={k}
                                                                className={
                                                                    checkReceiverId === val
                                                                        ? "chat-receiver-list__menu-item chat-receiver-list__menu-item--checked"
                                                                        : "chat-receiver-list__menu-item"
                                                                }
                                                            >
                                                                <button id={val} onClick={(e) => handleClickReceiver(e.target.id)}>
                                                                    {props.chatState.users[val]}
                                                                </button>
                                                            </li>
                                                        )
                                                })}
                                            </div>
                                        </div>
                                    </section>
                                </ul>
                            </div>
                            {checkReceiverId === "all" ? null : <span className="chat-receiver-list__privately-chat">(Privately)</span>}
                        </div>
                    </div>
                    <textarea
                        className="chat-box__chat-textarea"
                        tabIndex="0"
                        type="text"
                        maxLength="1024"
                        title="chat message"
                        rows="3"
                        placeholder="Type message here ..."
                        spellCheck="true"
                        onKeyUp={(e) => {
                            if (e.keyCode === 13) {
                                if (e.shiftKey) {
                                    // setChatContent(...chatContent, chatContent + "\n")
                                    return
                                }
                                handleSendMessage(chatContent.trim())
                                setChatContent("")
                            }
                        }}
                        onChange={(e) => setChatContent(e.target.value)}
                        value={chatContent}
                    ></textarea>
                </div>
            </div>
        </div>
    )
}
