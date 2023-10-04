import { css } from "@emotion/css";
import { MouseEventHandler, ReactNode } from "react";

const Button = ({
  onClick,
  children,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}) => (
  <button className='login-button' onClick={onClick}>
    {children}
  </button>
);

export default Button;
