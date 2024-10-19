import { useState } from "react";
// import useGameSetUp from "../hooks/useGameSetUp";

export interface MessageLine {
  user: string,
  message: string
}

export interface ChatProps {
  messages: MessageLine[]
}


export const Chat = () => {

  // const { players, orientation } = useGameSetUp()

  // const username = orientation === "white" ? players[0].username : players[1].username

  const username = "Semajut360"


  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<MessageLine[]>([])

  const handleAddMessage = (event: React.KeyboardEvent, message: MessageLine) => {
    if (event.key === "Enter") {
      event.preventDefault()
      console.log("In Enter")
      addMessage(message)
      setMessage("")
    }
  }

  const addMessage = (message: MessageLine) => {
    setMessages(prevMessages => [...prevMessages, message])
  }

  const messagesElms = messages.map(m => {
    return (
      <div className="flex gap-2">
         <h3 className="font-bold">{m.user}</h3>
         <p>{m.message}</p>
      </div>
    )
  })

  return (
    <section className="h-3/4 bg-light-grey rounded-lg">

      <div className="flex items-center h-[10%] px-3 py-1 bg-lighter-grey rounded-t-lg">
        <h2>Chat Room</h2>
      </div>

      <div className="h-[80%] px-3 py-2 overflow-scroll no-scrollbar">
        {messagesElms}
      </div>

      <div className="h-[10%]">
        <form className="h-full">
            <input 
              className="w-full h-full py-2 px-3 bg-lighter-grey focus:outline-none rounded-b-lg"
              type="input" 
              placeholder="Please be nice in the chat!"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => handleAddMessage(e, {user: username, message: message})}
              />
        </form>
      </div>
      

    </section>
  )
}
