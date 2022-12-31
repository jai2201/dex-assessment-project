import React, { Fragment } from 'react';
import { Modal } from 'react-bootstrap';

export default function AddModal({
  addModalShow,
  setAddModalShow,
  title,
  ...props
}) {
  return (
    <Fragment>
      <Modal
        show={addModalShow}
        onHide={() => setAddModalShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="body">{props.children}</Modal.Body>
      </Modal>
    </Fragment>
  );
}
