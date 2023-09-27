import { css } from "@emotion/css";
import { MouseEventHandler, ReactNode } from "react";

const Button = ({
  onClick,
  children,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}) => (
  <button className={buttonStyle} onClick={onClick}>
    {children}
  </button>
);

const buttonStyle = css`
  margin: 10px auto;
  padding: 14px;
  width: 300px;
  border: none;
  cursor: pointer;
  border-radius: 999px;
  outline: none;
  margin-top: 20px;
  transition: all 0.25s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

export default Button;
