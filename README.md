# Componentクラス

Componentクラスは、HTML要素を操作するための抽象化されたクラスです。イベントリスナーの追加、削除、ディスパッチや、子要素の参照の取得、マウント、アンマウントなど、HTML要素に対する操作を簡単に行えます。

# 使用方法

1. Component クラスをインポートします。

```typescript
import {Component} from 'your-package-name';
```

2. Component クラスを継承したカスタムクラスを作成します。

```typescript
class MyComponent extends Component {
  constructor(element) {
    super(element)
  }

  didMount() {
// コンポーネントがマウントされた時の処理
  }

  willUnmount() {
// コンポーネントがアンマウントされる前の処理
  }

  didUnmount() {
// コンポーネントがアンマウントされた時の処理
  }
}
```

3. カスタムコンポーネントを使用します。

```typescript
const element = document.getElementById('my-element');
const myComponent = new MyComponent(element);
myComponent.mount();
```
