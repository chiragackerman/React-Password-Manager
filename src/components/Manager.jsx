// Import libraries, icons, and animations.
import { useRef, useState, useEffect } from 'react'
import { Player } from '@lordicon/react'
import ADD_ICON from '../assets/icons/add.json'
import EDIT_ICON from '../assets/icons/Edit.json'
import DELETE_ICON from '../assets/icons/Delete.json'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Render the copy-to-clipboard animation.
const CopyAnimation = () => {
  const copyPlayerRef = useRef(null)

  const playCopyAnimation = () => {
    copyPlayerRef.current?.play()
  }

  return (
    <DotLottieReact
      src="/icons/Copy.lottie"
      tabIndex={0}
      aria-label="Copy password"
      dotLottieRefCallback={(dotLottie) => {
        copyPlayerRef.current = dotLottie
      }}
      onMouseEnter={playCopyAnimation}
      onFocus={playCopyAnimation}
      style={{ width: '38px', height: '38px', cursor: 'pointer' }}
    />
  )
}

// Render animated action icons.
const AnimatedPlayer = ({ icon, size }) => {
  const playerRef = useRef(null)

  const playAnimation = () => {
    playerRef.current?.playFromBeginning()
  }

  return (
    <span className="cursor-pointer" tabIndex={0} onMouseEnter={playAnimation} onFocus={playAnimation}>
      <Player ref={playerRef} icon={icon} size={size} />
    </span>
  )
}

// Manage password form data and saved passwords.
const Manager = () => {
  const ref = useRef()
  const passwordRef = useRef()

  const [form, setform] = useState({ site: "", username: "", password: "" })
  const [passwordArray, setpasswordArray] = useState([])

  const getPasswords = async () => {
    let req = await fetch(`${import.meta.env.VITE_API_URL}/`)
    let passwords = await req.json()
    setpasswordArray(passwords)
    console.log(passwords)
  }

  useEffect(() => {
    getPasswords()
  }, [])
  

  // // Load saved passwords from local storage.
  // useEffect(() => {
  //   let passwords = localStorage.getItem("passwords")
  //   if (passwords) {
  //     setpasswordArray(JSON.parse(passwords))
  //   }
  // }, [])


  // Toggle password visibility in the form.
  const showPass = () => {
    if (form.password.length > 0 && ref.current.src.includes("icons/view.png")) {
      ref.current.src = "icons/hide.png"
      passwordRef.current.type = "text"
    }
    else if (form.password.length > 0) {
      ref.current.src = "icons/view.png"
      passwordRef.current.type = "password"
    }
  }

  // Validate and save a password to local storage.
  const savePassword = async () => {
    if (form.site.length >= 5 && form.username.length >= 3 && form.password.length >= 4) {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      })

      const result = await response.json()
      if (!response.ok || !result.result?.insertedId) {
        throw new Error('Unable to save password')
      }

      setpasswordArray((currentPasswords) => [
        ...currentPasswords,
        { ...form, _id: result.result.insertedId }
      ])
      setform({ site: "", username: "", password: "" })
      toast.success('Password Saved!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
    if (form.site.length < 5) {
      toast.error('URL must be at least 5 characters long!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
    if (form.username.length < 3) {
      toast.error('Username must be at least 3 characters long!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
    if (form.password.length < 4) {
      toast.error('Password must be at least 4 characters long!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }

  // Update form values as the user types.
  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value })
    ref.current.src = "icons/view.png"
  }

  // Copy a password value to the clipboard.
  const copyToClipboard = (text) => {
    toast('Copied to clipboard!', {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    navigator.clipboard.writeText(text)
  }

  // Remove a password from the database.
  const removePassword = async (passwordId) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ _id: passwordId })
    })
    const result = await response.json()

    if (!response.ok || result.result?.deletedCount !== 1) {
      throw new Error('Unable to delete password')
    }

    setpasswordArray((currentPasswords) =>
      currentPasswords.filter((password) => password._id !== passwordId)
    )
  }

  // Delete a password and show confirmation.
  const deletePassword = async (passwordId) => {
    await removePassword(passwordId)
    toast.success('Password deleted!', {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }

  // Load a saved password back into the form for editing.
  const editPassword = async (index) => {
    const passwordToEdit = passwordArray[index]
    setform(passwordToEdit)
    await removePassword(passwordToEdit._id)
  }

  // Render the password manager interface.
  return (
    <div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="dark"
        transition={Bounce}
      />
      <div className="heading">
        <h1 className='text-3xl tracking-wider font-bold text-center my-4'>PassMan - Your Own Password Manager</h1>
      </div>
      <div className="inputcontainer md:w-[70vw] w-[90vw] mx-auto relative flex flex-col items-center justify-center">
        <input name='site' value={form.site} onChange={handleChange} type="url" minLength={5} className='border-2 w-full border-gray-500 p-3 m-2 text-white rounded-lg' placeholder="Enter URL" />
        <div className="flex flex-col md:gap-2 md:flex-row md:w-[70vw] w-[90vw] relative justify-center">
          <input name='username' value={form.username} onChange={handleChange} type="text" minLength={3} maxLength={15} className='border-2 md:w-[50%] w-full border-gray-500 p-3 my-2 text-white rounded-lg' placeholder="Enter Username" />
          <div className="relative md:w-[50%] w-full">
            <input ref={passwordRef} name='password' value={form.password} onChange={handleChange} type="password" minLength={4} maxLength={10} className='border-2  w-full border-gray-500 p-3 my-2 text-white rounded-lg' placeholder="Enter Password" />
            <span className='absolute right-[4%] top-1/2 transform -translate-y-1/2 cursor-pointer'>
              <img ref={ref} onClick={() => showPass()} src="icons/view.png" alt="eye" />
            </span>
          </div>
        </div>
        <button
          onClick={async () => { await savePassword()}}
          className=' flex cursor-pointer font-bold items-center justify-center gap-2 bg-white text-black p-2 px-3 m-2 rounded-xl'
        >
          Save Password
          <span>
            <AnimatedPlayer icon={ADD_ICON} size={30} />
          </span>
        </button>
      </div>
      <div className="passwords md:w-[70vw] w-[90vw] mx-auto my-4 pb-15">
        {passwordArray.length === 0 && (
          <h2 className='text-2xl tracking-wider font-bold text-center my-4'>No Passwords Saved Yet</h2>
        )}
        {passwordArray.length > 0 &&
          <h2 className='text-2xl tracking-wider font-bold text-center my-4'>Your Saved Passwords</h2>
        }
        {passwordArray.length > 0 &&
          <div className="passwordlists">
            <table className='password-table rounded-xl overflow-hidden border-collapse table-fixed text-lg border w-full border-gray-500'>
              <thead>
                <tr className='bg-black opacity-80 text-white'>
                  <th className=' p-3 w-4/9'>Site</th>
                  <th className=' p-3 w-2/9'>Username</th>
                  <th className=' p-3 w-2/9'>Password</th>
                  <th className=' p-3 w-1/9'>Actions</th>
                </tr>
              </thead>
              <tbody className='text-white text-center'>
                {passwordArray.map((item, index) => (
                  <tr key={index} className={`password-row ${index % 2 === 0 ? 'bg-gray-900 opacity-80 overflow-hidden h-12' : 'bg-black opacity-80 overflow-hidden h-12'}`}>
                    <td data-label='Site' className='site-cell underline p-3 relative'><div className='flex justify-center items-center'><a href={item.site}>{item.site}</a><span onClick={() => copyToClipboard(item.site)} aria-label='Copy' className='inline-block w-10 align-middle'><CopyAnimation /></span></div></td>
                    <td data-label='Username' className='p-3'><div className='flex justify-center items-center'> {item.username}<span onClick={() => copyToClipboard(item.username)} aria-label='Copy' className='inline-block w-10 align-middle'><CopyAnimation /></span></div></td>
                    <td data-label='Password' className='p-3'><div className='flex justify-center items-center'>{"*".repeat(item.password.length)}<span onClick={() => copyToClipboard(item.password)} aria-label='Copy' className='inline-block w-10 align-middle'><CopyAnimation /></span></div></td>
                    <td data-label='Actions' className='p-3'><div className='flex justify-center items-center gap-1.5'>
                      <span onClick={() => editPassword(index)}><AnimatedPlayer icon={EDIT_ICON} size={26} /></span>
                      <span onClick={() => deletePassword(item._id)}><AnimatedPlayer icon={DELETE_ICON} size={24} /></span>
                    </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  )
}

export default Manager
