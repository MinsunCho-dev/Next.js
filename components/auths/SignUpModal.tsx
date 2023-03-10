import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { userActions } from "../../store/user";
import MailIcon from "../../public/static/svg/input/mail.svg";
import PersonIcon from "../../public/static/svg/input/person.svg";
import OpenedEyeIcon from "../../public/static/svg/input/opened-eye.svg";
import ClosedEyeIcon from "../../public/static/svg/input/closed_eye.svg";
import palette from "../../styles/palette";
import Selector from "../common/selector/Selector";
import { monthsList, daysList, yearsList } from "../../lib/staticData";
import Button from "../common/button/Button";
import { signupAPI } from "../../lib/api/auth";
import PasswordWarning from "./PasswordWarning";
import { authActions } from "../../store/auth";
import Input from "../common/Input";
import useValidateMode from "../../hooks/useValidateMode";

const Container = styled.div`
  .sign-up-input-wrapper {
    position: relative;
    margin-bottom: 16px;
  }
  .sign-up-password-input-wrapper {
    svg {
      cursor: pointer;
    }
  }

  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .sign-up-modal-birthday-info {
    margin-bottom: 16px;
    color: ${palette.charcoal};
  }

  .sign-up-modal-birthday-selectors {
    display: flex;
    margin-bottom: 24px;
    .sign-up-modal-birthday-month-selector {
      margin-right: 16px;
      flex-grow: 1;
    }
    .sign-up-modal-birthday-day-selector {
      margin-right: 16px;
      width: 25%;
    }
    .sign-up-modal-birthday-year-selector {
      width: 33.3333%;
    }
  }

  .sign-up-modal-submit-button-wrapper {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid ${palette.gray_eb};
  }
  .sign-up-modal-set-login {
    color: ${palette.dark_cyan};
    margin-left: 8px;
    cursor: pointer;
  }
`;

const PASSWORD_MIN_LENGTH = 8;

interface IProps {
  closeModalPortal: () => void;
}

const SignUpModal: React.FC<IProps> = ({ closeModalPortal }) => {
  const [email, setEmail] = useState("");
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHided, setIsPasswordHided] = useState(true);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [birthYear, setBirthYear] = useState<string | null>(null);
  const [birthDay, setBirthDay] = useState<string | null>(null);
  const [birthMonth, setBirthMonth] = useState<string | null>(null);

  const dispatch = useDispatch();
  const { validateMode, setValidateMode } = useValidateMode();

  //*???????????? ?????? ????????????
  const togglePasswordHiding = () => {
    setIsPasswordHided(!isPasswordHided);
  };

  //* password??? ???????????? ???????????? ???????????????
  const isPasswordHasNameOrEmail = useMemo(
    () =>
      !password ||
      !lastname ||
      password.includes(lastname) ||
      password.includes(email.split("@")[0]),
    [password, lastname, email]
  );

  //* ??????????????? ?????? ????????? ????????????
  const isPasswordOverMinLength = useMemo(
    () => password.length >= PASSWORD_MIN_LENGTH,
    [password]
  );
  //* ??????????????? ????????? ??????????????? ???????????????
  const isPasswordHasNumberOrSymbol = useMemo(
    () =>
      /[{}[\]/?.,;:|)*~`!^\-_+<>@#$%&\\=('"]/g.test(password) ||
      /[0-9]/g.test(password),
    [password]
  );

  //* ????????? ??????????????? ?????? ??????
  const validateSignUpForm = () => {
    if (!email) {
      return false;
    }
    if (!lastname) {
      return false;
    }
    if (!firstname) {
      return false;
    }
    if (!birthMonth) {
      return false;
    }
    if (!birthDay) {
      return false;
    }
    if (!birthYear) {
      return false;
    }
    if (
      !password ||
      isPasswordHasNameOrEmail ||
      !isPasswordHasNumberOrSymbol ||
      !isPasswordOverMinLength
    ) {
      return false;
    }
    return true;
  };

  //* ???????????? ?????? ???
  const onSubmitSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidateMode(true);

    if (validateSignUpForm()) {
      try {
        const signUpBody = {
          email,
          lastname,
          firstname,
          password,
          birthday: new Date(
            `${birthYear}-${birthMonth!.replace("???", "")}-${birthDay}`
          ),
        };
        const { data } = await signupAPI(signUpBody);
        dispatch(userActions.setUser(data));
        closeModalPortal();
      } catch (e) {
        console.log(e);
        alert(e.data);
      }
    }
  };

  useEffect(() => {
    setValidateMode(false);
  }, []);

  return (
    <Container>
      <form onSubmit={onSubmitSignUp}>
        <div className="sign-up-input-wrapper">
          <Input
            name="email"
            placeholder="????????? ??????"
            type="email"
            icon={<MailIcon />}
            value={email}
            isValid={!!email}
            useValidation={validateMode}
            onChange={(e) => setEmail(e.target.value)}
            errorMessage="???????????? ???????????????."
          />
        </div>
        <div className="sign-up-input-wrapper">
          <Input
            name="lastname"
            placeholder="??????(???:??????)"
            icon={<PersonIcon />}
            value={lastname}
            isValid={!!lastname}
            useValidation={validateMode}
            onChange={(e) => setLastname(e.target.value)}
            errorMessage="????????? ???????????????."
          />
        </div>
        <div className="sign-up-input-wrapper">
          <Input
            name="firstname"
            placeholder="???(???: ???)"
            icon={<PersonIcon />}
            value={firstname}
            isValid={!!firstname}
            useValidation={validateMode}
            onChange={(e) => setFirstname(e.target.value)}
            errorMessage="?????? ???????????????."
          />
        </div>
        <div className="sign-up-input-wrapper sign-up-password-input-wrapper">
          <Input
            name="password"
            placeholder="???????????? ????????????"
            type={isPasswordHided ? "password" : "text"}
            icon={
              isPasswordHided ? (
                <ClosedEyeIcon onClick={togglePasswordHiding} />
              ) : (
                <OpenedEyeIcon onClick={togglePasswordHiding} />
              )
            }
            onFocus={() => setPasswordFocused(true)}
            value={password}
            isValid={!!password}
            useValidation={validateMode}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage="??????????????? ???????????????."
          />
        </div>

        {passwordFocused && (
          <>
            <PasswordWarning
              isValid={!isPasswordHasNameOrEmail}
              errorMessage="??????????????? ?????? ???????????? ????????? ????????? ????????? ??? ????????????."
            />
            <PasswordWarning
              isValid={isPasswordOverMinLength}
              errorMessage="?????? 8???"
            />
            <PasswordWarning
              isValid={isPasswordHasNumberOrSymbol}
              errorMessage="????????? ????????? ???????????????."
            />
          </>
        )}

        <h4>??????</h4>
        <p className="sign-up-modal-birthday-info">
          ??? 18??? ????????? ????????? ???????????? ????????? ??? ????????????. ????????? ??????
          ??????????????? ??????????????? ???????????? ????????????.
        </p>
        <div className="sign-up-modal-birthday-selectors">
          <div className="sign-up-modal-birthday-month-selector">
            <Selector
              options={["???", ...monthsList]}
              value={birthMonth || "???"}
              disabledOptions={["???"]}
              onChange={(e) => setBirthMonth(e.target.value)}
              isValid={!!birthMonth}
            />
          </div>
          <div className="sign-up-modal-birthday-day-selector">
            <Selector
              options={["???", ...daysList]}
              value={birthDay || "???"}
              disabledOptions={["???"]}
              onChange={(e) => setBirthDay(e.target.value)}
              isValid={!!birthDay}
            />
          </div>
          <div className="sign-up-modal-birthday-year-selector">
            <Selector
              options={["???", ...yearsList]}
              value={birthYear || "???"}
              disabledOptions={["???"]}
              onChange={(e) => setBirthYear(e.target.value)}
              isValid={!!birthYear}
            />
          </div>
        </div>
        <div className="sign-up-modal-submit-button-wrapper">
          <Button type="submit" width="100%">
            ?????? ??????
          </Button>
        </div>
        <p>
          ?????? ??????????????? ????????? ??????????
          <span
            className="sign-up-modal-set-login"
            role="presentation"
            onClick={() => dispatch(authActions.setAuthMode("login"))}
          >
            ?????????
          </span>
        </p>
      </form>
    </Container>
  );
};

export default SignUpModal;
