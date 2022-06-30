// Started at 11:25 6-29-2022

import React from "react";

export default function FormInput({ name, label, placeholder, ...rest }) {
  return (
    <div className="flex flex-col-reverse">
      <input
        id={name}
        name={name}
        className="bg-transparent rounded border-2 dark:border-dark-subtle border-light-subtle w-full text-lg outline-none dark:focus:border-white focus:border-primary p-1 dark:text-white peer transition"
        placeholder={placeholder}
        {...rest}
      />
      <label
        className="font-semibold dark:text-dark-subtle text-light-subtle dark:peer-focus:text-white peer-focus:text-primary transition self-start"
        htmlFor={name}
      >
        {label}
      </label>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { BsFillSunFill } from "react-icons/bs";
import { useTheme } from "../../hooks";

export default function Header({ onAddMovieClick, onAddActorClick }) {
  const [showOptions, setShowOptions] = useState(false);
  const { toggleTheme } = useTheme();

  const options = [
    { title: "Add Movie", onClick: onAddMovieClick },
    { title: "Add Actor", onClick: onAddActorClick },
  ];

  return (
    <div className="flex items-center justify-between relative">
      <input
        type="text"
        className="border-2 dark:border-dark-subtle border-light-subtle dark:focus:border-white focus:border-primary dark:text-white transition bg-transparent rounded text-lg p-1 outline-none"
        placeholder="Search Movies..."
      />

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          className="dark:text-white text-light-subtle"
        >
          <BsFillSunFill size={24} />
        </button>
        <button
          onClick={() => setShowOptions(true)}
          className="flex items-center space-x-2 dark:border-dark-subtle border-light-subtle dark:text-dark-subtle text-light-subtle hover:opacity-80 transition font-semibold border-2 rounded text-lg px-3 py-1"
        >
          <span>Create</span>
          <AiOutlinePlus />
        </button>

        <CreateOptions
          visible={showOptions}
          onClose={() => setShowOptions(false)}
          options={options}
        />
      </div>
    </div>
  );
}

const CreateOptions = ({ options, visible, onClose }) => {
  const container = useRef();
  const containerID = "option-container";

  useEffect(() => {
    const handleClose = (e) => {
      if (!visible) return;
      const { parentElement, id } = e.target;

      if (parentElement.id === containerID || id === containerID) return;

      container.current.classList.remove("animate-scale");
      container.current.classList.add("animate-scale-reverse");
    };

    document.addEventListener("click", handleClose);
    return () => {
      document.removeEventListener("click", handleClose);
    };
  }, [visible]);

  const handleAnimationEnd = (e) => {
    if (e.target.classList.contains("animate-scale-reverse")) onClose();
    e.target.classList.remove("animate-scale");
  };

  if (!visible) return null;
  return (
    <div
      id={containerID}
      ref={container}
      className="absolute right-0 top-12 flex flex-col space-y-3 p-5  dark:bg-secondary bg-white drop-shadow-lg rounded animate-scale"
      onAnimationEnd={handleAnimationEnd}
    >
      {options.map(({ title, onClick }) => {
        return <Option onClick={onClick}>{title}</Option>;
      })}
    </div>
  );
};

const Option = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="dark:text-white text-secondary hover:opacity-80 transition"
    >
      {children}
    </button>
  );
};

import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { uploadTrailer } from "../../api/movie";
import { useNotification } from "../../hooks";

export default function MovieUpload() {
  const [videoSelected, setVideoSelected] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState({});
  const [movieInfo, setMovieInfo] = useState({
    title: "",
    storyLine: "",
    tags: [],
    cast: [],
    director: {},
    writers: [],
    releseDate: "",
    poster: null,
    genres: [],
    type: "",
    language: "",
    status: "",
    trailer: {
      url: "",
      public_id: "",
    },
  });
  const { updateNotification } = useNotification();

  const handleTypeError = (error) => {
    updateNotification("error", error);
  };

  const handleUploadTrailer = async (data) => {
    const { error, url, public_id } = await uploadTrailer(
      data,
      setUploadProgress
    );
    if (error) return updateNotification("error", error);

    setVideoUploaded(true);
    setVideoInfo({ url, public_id });
  };

  console.log(videoInfo);

  const handleChange = (file) => {
    const formData = new FormData();
    formData.append("video", file);

    setVideoSelected(true);
    handleUploadTrailer(formData);
  };

  const getUploadProgressValue = () => {
    if (!videoUploaded && uploadProgress >= 100) {
      return "Proccessing";
    }

    return `Upload progress ${uploadProgress}%`;
  };

  return (
    <div className="fixed inset-0 dark:bg-white dark:bg-opacity-50 bg-primary bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      <div className="dark:bg-primary bg-white rounded w-[45rem] h-[40rem] overflow-auto p-2">
        <UploadProgress
          visible={!videoUploaded && videoSelected}
          message={getUploadProgressValue()}
          width={uploadProgress}
        />
        <TrailerSelector
          visible={!videoSelected}
          onTypeError={handleTypeError}
          handleChange={handleChange}
        />
      </div>
    </div>
  );
}

const TrailerSelector = ({ visible, handleChange, onTypeError }) => {
  if (!visible) return null;

  return (
    <div className="h-full flex items-center justify-center">
      <FileUploader
        handleChange={handleChange}
        onTypeError={onTypeError}
        types={["mp4", "avi"]}
      >
        <div className="w-48 h-48 border border-dashed dark:border-dark-subtle border-light-subtle rounded-full flex flex-col items-center justify-center dark:text-dark-subtle text-secondary cursor-pointer">
          <AiOutlineCloudUpload size={80} />
          <p>Drop your file here</p>
        </div>
      </FileUploader>
    </div>
  );
};

const UploadProgress = ({ width, message, visible }) => {
  if (!visible) return null;

  return (
    <div className="dark:bg-secondary bg-white drop-shadow-lg rounded p-3">
      <div className="relative h-3 dark:bg-dark-subtle bg-light-subtle overflow-hidden">
        <div
          style={{ width: width + "%" }}
          className="h-full w-[50%] absolute left-0 dark:bg-white bg-secondary"
        />
      </div>
      <p className="font-semibold dark:text-dark-subtle text-light-subtle animate-pulse mt-1">
        {message}
      </p>
    </div>
  );
};

import React from "react";
import { Route, Routes } from "react-router-dom";
import Actors from "../components/admin/Actors";
import Dashboard from "../components/admin/Dashboard";
import Header from "../components/admin/Header";
import Movies from "../components/admin/Movies";
import Navbar from "../components/admin/Navbar";
import NotFound from "../components/NotFound";

export default function AdminNavigator() {
  return (
    <div className="flex dark:bg-primary bg-white">
      <Navbar />
      <div className="flex-1 p-2 max-w-screen-xl">
        <Header
          onAddMovieClick={() => console.log("Adding movie")}
          key="index"
        />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/actors" element={<Actors />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

import React from "react";
import { Link, NavLink } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import { BiMoviePlay } from "react-icons/bi";
import { FaUserNinja } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../hooks";

export default function Navbar() {
  const { handleLogout } = useAuth();
  return (
    <nav className="w-48 min-h-screen bg-secondary border-r border-gray-300">
      <div className="flex flex-col justify-between pl-5 h-screen sticky top-0">
        <ul>
          <li className="mb-8">
            <Link to="/">
              <img src="./logo.png" alt="logo" className="h-14 p-2" />
            </Link>
          </li>

          <li>
            <NavItem to="/">
              <AiOutlineHome />
              <span>Home</span>
            </NavItem>
          </li>
          <li>
            <NavItem to="/movies">
              <BiMoviePlay />
              <span>Movies</span>
            </NavItem>
          </li>
          <li>
            <NavItem to="/actors">
              <FaUserNinja />
              <span>Actors</span>
            </NavItem>
          </li>
        </ul>

        <div className="flex flex-col items-start pb-5">
          <span className="font-semibold text-white text-xl">Admin</span>
          <button
            onClick={handleLogout}
            className="flex items-center text-dark-subtle text-sm hover:text-white transition space-x-1"
          >
            <FiLogOut />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

const NavItem = ({ children, to }) => {
  const commonClasses =
    " flex items-center text-lg space-x-2 p-2 hover:opacity-80";
  return (
    <NavLink
      className={({ isActive }) =>
        (isActive ? "text-white" : "text-gray-400") + commonClasses
      }
      to={to}
    >
      {children}
    </NavLink>
  );
};

import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIsAuth, signInUser } from "../api/auth";
import { useNotification } from "../hooks";

export const AuthContext = createContext();

const defaultAuthInfo = {
  profile: null,
  isLoggedIn: false,
  isPending: false,
  error: "",
};

export default function AuthProvider({ children }) {
  const [authInfo, setAuthInfo] = useState({ ...defaultAuthInfo });
  const { updateNotification } = useNotification();

  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setAuthInfo({ ...authInfo, isPending: true });
    const { error, user } = await signInUser({ email, password });
    if (error) {
      updateNotification("error", error);
      return setAuthInfo({ ...authInfo, isPending: false, error });
    }

    navigate('/', { replace: true });
    setAuthInfo({
      profile: { ...user },
      isLoggedIn: true,
      isPending: false,
      error: "",
    });

    localStorage.setItem("auth-token", user.token);
  };

  const isAuth = async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;

    setAuthInfo({ ...authInfo, isPending: true });
    const { error, user } = await getIsAuth(token);
    if (error) {
      updateNotification("error", error);
      return setAuthInfo({ ...authInfo, isPending: false, error });
    }

    setAuthInfo({
      profile: { ...user },
      isLoggedIn: true,
      isPending: false,
      error: "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    setAuthInfo({ ...defaultAuthInfo });
  };

  useEffect(() => {
    isAuth();
  }, []);

  //  handleLogout
  return (
    <AuthContext.Provider
      value={{ authInfo, handleLogin, handleLogout, isAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resendEmailVerificationToken, verifyUserEmail } from '../../api/auth';
import { useAuth, useNotification } from '../../hooks';

import { commonModalClasses } from '../../utils/theme';
import Container from "../Container"
import FormContainer from '../form/FormContainer';
import Submit from '../form/Submit';
import Title from '../form/Title';

const OTP_LENGTH = 6;
let currentOTPIndex;

const isValidOTP = (otp) => {
    let valid = false;
  
    for (let val of otp) {
      valid = !isNaN(parseInt(val));
      if (!valid) break;
    }
  
    return valid;
  };

export default function EmailVerification() {
const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
const [activeOtpIndex, setActiveOtpIndex] = useState(0);

const { isAuth, authInfo } = useAuth();
const { isLoggedIn, profile } = authInfo;
const isVerified = profile?.isVerified;

const inputRef = useRef()
const {updateNotification} = useNotification();

const { state } = useLocation();
const user = state?.user;

const navigate = useNavigate();

const focusNextInputField = (index) => {
    setActiveOtpIndex(index + 1);
}

const focusPreviousInputField = (index) => {
    let nextIndex;
    const diff = index - 1;
    nextIndex = diff !== 0 ? diff : 0;

    setActiveOtpIndex(nextIndex);
}

const handleOtpChange = ({ target }) => {
    const { value } = target;
    const newOtp = [...otp];
    newOtp[currentOTPIndex] = value.substring(value.length - 1, value.length);
 
    if (!value) focusPreviousInputField(currentOTPIndex);
    else focusNextInputField(currentOTPIndex);
 
    setOtp([...newOtp]);
};

const handleOTPResend = async () => {
  const { error, message } = await resendEmailVerificationToken(user.id);

  if (error) return updateNotification("error", error);

  updateNotification("success", message);
};

const handleKeyDown = ({ key }, index) => {
    currentOTPIndex = index;
    if (key === "Backspace") {
        focusPreviousInputField(currentOTPIndex);
     }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidOTP(otp)) return updateNotification("error", "invalid OTP");

    // submit otp
    const {
      error,
      message,
      user: userResponse,
    } = await verifyUserEmail({
      OTP: otp.join(""),
      userId: user.id,
    });
    console.log("error", error)
    console.log("user", user)
    console.log("message", message)
    if (error) return updateNotification("error", error);

    updateNotification("success", message);
    localStorage.setItem("auth-token", userResponse.token);
    isAuth();
  };

    useEffect(() => {
        inputRef.current?.focus();
    }, [activeOtpIndex])

    useEffect(() => {
        if(!user) navigate('/not-found');
        if(isLoggedIn && isVerified) navigate('/');
    }, [user, isLoggedIn, isVerified]);

    // if(!user) return null;

  return <FormContainer>
  <Container>
      <form onSubmit={handleSubmit} className={commonModalClasses}>
          <div>
          <Title>Please enter the OTP to verify your account</Title>
          <p className='text-center dark:text-dark-subtle text-left-subtle'>OTP has been sent to your email</p>
          </div>

        <div className='flex justify-center items-center space-x-4'>
          {otp.map((_, index) => {
              return (
              <input
              ref={activeOtpIndex === index ? inputRef : null}
              key={index}
               type="number"
              value={otp[index] || ''}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
               className="w-12 h-12 border-2 dark:border-dark-subtle border-light-subtle dark:focus:border-white focus:border-primary rounded bg-transparent outline-none text-center dark:text-white text-primary font-semibold text-xl spin-button-none" />
              );
          })}
        </div>

          <div>
          <Submit value="Verify Account" />    
          <button onClick={handleOTPResend} type='button' className='dark:text-white text-blue-500 font-semibold hover:underline mt-2'>I don't have OTP</button>
          </div>
      </form>
  </Container>
  </FormContainer>
}

import React from "react";
import MovieUpload from "./MovieUpload";

export default function Dashboard() {
  return <MovieUpload />;
}

import React from "react";
import { BsFillSunFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useAuth, useTheme } from "../../hooks";
import Container from "../Container";

export default function Navbar() {
  const { toggleTheme } = useTheme();
  const { authInfo, handleLogout } = useAuth();
  const { isLoggedIn } = authInfo;

  return (
    <div className="bg-secondary shadow-sm shadow-gray-500">
      <Container className="p-2">
        <div className="flex justify-between items-center">
          <Link to="/">
            <img src="./logo.png" alt="" className="h-10" />
          </Link>

          <ul className="flex items-center space-x-4">
            <li>
              <button
                onClick={toggleTheme}
                className="dark:bg-white bg-dark-subtle p-1 rounded"
              >
                <BsFillSunFill className="text-secondary" size={24} />
              </button>
            </li>
            <li>
              <input
                type="text"
                className="border-2 border-dark-subtle p-1 rounded bg-transparent text-xl outline-none focus:border-white transition text-white"
                placeholder="search..."
              />
            </li>
            <li>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-white font-semibold text-lg"
                >
                  Log out
                </button>
              ) : (
                <Link
                  className="text-white font-semibold text-lg"
                  to="/auth/signin"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      </Container>
    </div>
  );
}

import React from "react";

export default function FormContainer({ children }) {
  return (
    <div className="fixed inset-0 dark:bg-primary bg-white -z-10 flex justify-center items-center">
      {children}
    </div>
  );
}

import client from "./client";

export const uploadTrailer = async (formData, onUploadProgress) => {
  const token = localStorage.getItem("auth-token");
  try {
    const { data } = await client.post("/movie/upload-trailer", formData, {
      headers: {
        authorization: "Bearer " + token,
        "content-type": "multipart/form-data",
      },
      onUploadProgress: ({ loaded, total }) => {
        if (onUploadProgress)
          onUploadProgress(Math.floor((loaded / total) * 100));
      },
    });
    return data;
  } catch (error) {
    console.log(error.response.data);
    const { response } = error;
    if (response?.data) return response.data;

    return { error: error.message || error };
  }
};

// Ended at 8:49 6-29-2022
