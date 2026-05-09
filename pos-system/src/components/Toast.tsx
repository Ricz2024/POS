import { useState, useEffect } from 'react'

interface Props {
  msg: string
  icon: string
}

export default function Toast({ msg, icon }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 10)
    const t2 = setTimeout(() => setShow(false), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className={`toast success ${show ? 'show' : ''}`}>
      <i className={`ti ${icon}`} />
      <span>{msg}</span>
    </div>
  )
}
