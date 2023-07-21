import classNames from "classnames";

export interface IonIconProps {
  name: string;
  className?: string;
}

export default function IonIcon({ name, className }: IonIconProps) {
  /* eslint-disable */
  // @ts-expect-error No error
    return (<span className={classNames("ionicon-wrapper", className)}><ion-icon name={name} /></span>);
  /* eslint-enable */
}
