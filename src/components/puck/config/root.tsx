import { DefaultRootProps } from "../core";
import { Footer } from "./components/footer";
import { Header } from "./components/header";

export type RootProps = DefaultRootProps;

function Root({ children, puck }: RootProps) {
  return (
    <>
      <Header editMode={puck.isEditing} />
      {children}
      <Footer>
        <Footer.List title="Section">
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
        </Footer.List>
        <Footer.List title="Section">
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
        </Footer.List>
        <Footer.List title="Section">
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
        </Footer.List>
        <Footer.List title="Section">
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
          <Footer.Link href="">Label</Footer.Link>
        </Footer.List>
      </Footer>
    </>
  );
}

export default Root;
