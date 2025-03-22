import classNames from 'classnames';
import { Children, cloneElement, ReactElement, Ref } from 'react';

interface Props {
  children: ReactElement<{ className?: string; ref?: Ref<unknown> }>;
  classNames: {
    default?: string;
    hovered?: string;
  };
}

/**
 * Hoverable コンポーネント（CSSのみバージョン）
 *
 * JavaScriptでポインター位置を取得して判定する代わりに、
 * CSSの :hover 擬似クラス（もしくは Tailwind CSS の hover: プレフィックス）で
 * ホバー時のスタイル適用を行います。
 */
export const Hoverable = (props: Props) => {
  const child = Children.only(props.children);

  return cloneElement(child, {
    // default のクラスは常に適用し、hovered 用のクラスはホバー時に適用されるように設定
    // Tailwind CSS を使っている場合は、"hover:クラス名" という形式になります
    className: classNames(
      child.props.className,
      'cursor-pointer',
      props.classNames.default,
      props.classNames.hovered && `hover:${props.classNames.hovered}`
    ),
    // ポインター判定に関する処理は不要なので、refのマージも不要な場合は child.props.ref をそのまま渡します
  });
};
