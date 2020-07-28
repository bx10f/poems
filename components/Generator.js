import clip from '../utils/clip'
import data from '../utils/tweets'

import Tweet from '../components/Tweet'
import Poem from '../components/Poem'
import Button from '../components/Button'
import Toast from '../components/Toast'

export default function Generator() {
  const [poem, setPoem] = React.useState([data[295]])
  const [count, setCount] = React.useState(1)
  const [clicks, setClicks] = React.useState(0)
  const [isError, setIsError] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)
  const [isSharing, setIsSharing] = React.useState(false)
  const [isShared, setIsShared] = React.useState(false)
  const [shareUrl, setShareUrl] = React.useState('')

  const add = () => {
    const rand = data[Math.floor(Math.random() * data.length)]
    if (!poem.includes(rand)) {
      setPoem([...poem, rand])
      setCount(prevCount => prevCount + 1)
    } else {
      const altRand = data[Math.floor(Math.random() * data.length)]
      setPoem([...poem, altRand])
      setCount(prevCount => prevCount + 1)
    }
    setClicks(prev => prev + 1)
  }

  const remove = () => {
    const poemArr = [...poem]
    poemArr.pop()
    setPoem(poemArr)
    setCount(prevCount => prevCount - 1)
    setClicks(prev => prev + 1)
  }

  const replace = () => {
    const randTweet = data[Math.floor(Math.random() * data.length)]
    const poemArr = [...poem]
    poemArr[poemArr.length - 1] = randTweet
    setPoem(poemArr)
    setClicks(prev => prev + 1)
  }

  const handleError = () => {
    setIsError(false)
    setIsShared(false)
  }

  const handleToast = () => {
    setShowToast(false)
  }

  const copyUrl = async () => {
    try {
      const input = document.querySelector('#share-url')
      await clip(input.value)
      setShowToast(true)
    } catch (error) {
      console.log('Copying url error – ', error)
    }
  }

  const reset = () => {
    setPoem([data[Math.floor(Math.random() * data.length)]])
    setCount(1)
    setClicks(0)
    setIsError(false)
    setShowToast(false)
    setIsShared(false)
    setShareUrl('')
  }

  const share = async () => {
    const userData = {
      poem,
      clicks
    }
    setIsSharing(true)
    try {
      const res = await fetch('/api/save', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(userData)
      })
      var data = await res.json()
      setIsSharing(false)
      setIsShared(true)
      setShareUrl(`${window.origin}/${data.uid}`)
    } catch (err) {
      setIsError(true)
      console.log('Saving poem error — ', err)
    }
  }

  return (
    <>
      {!isShared ? (
        <section>
          <Button handleClick={replace} text="Swap Bottom" />
          <div>
            <Button
              handleClick={remove}
              disabled={count <= 1}
              alt="minus"
              emoji="➖"
              text="Line"
            />
            <Button
              customCSS={'margin-left: 0.65rem;'}
              handleClick={add}
              disabled={count >= 5}
              alt="plus"
              emoji="➕"
              text="Line"
            />
          </div>
        </section>
      ) : (
        <section>
          <Button
            customCSS={'margin-bottom: var(--md);'}
            handleClick={reset}
            alt="bomb"
            emoji="💣 "
            text="Make Another"
          />
          <label htmlFor="share-url">Your Poem's URL</label>
          <div className="saved-box">
            <input
              type="text"
              id="share-url"
              onChange={setShareUrl}
              value={shareUrl}
            />
            <Button
              customCSS={'margin-left: var(--sm);'}
              handleClick={copyUrl}
              text="Copy"
            />
          </div>
          {isError && (
            <Toast
              text="There was a problem saving your poem to the database."
              error
              dismiss
              handleDismiss={handleError}
            />
          )}
          {showToast && (
            <Toast
              text="URL copied to the clipboard."
              dismiss
              handleDismiss={handleToast}
            />
          )}
        </section>
      )}
      <Tweet>
        {!isShared && (
          <Button
            handleClick={share}
            disabled={count < 2 || isSharing}
            text={isSharing ? '∆·∇·∆' : 'Share'}
          />
        )}
      </Tweet>
      <Poem poem={poem} />
      <style jsx>{`
        label {
          display: block;
          font-size: 1.25rem;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .saved-box {
          display: flex;
          margin-bottom: var(--sm);
        }

        input[type='text'] {
          width: 100%;
          height: 4rem;
          padding: 0 var(--sm);
          font-size: var(--md);
          outline: none;
          border: none;
          background-color: var(--grey-bg);
          border-radius: var(--xs);
        }
      `}</style>
      <style jsx>{`
        section {
          margin-bottom: var(--md);
          ${!isShared
            ? 'display: flex; justify-content: space-between;'
            : 'position: relative;'}
        }
      `}</style>
    </>
  )
}
