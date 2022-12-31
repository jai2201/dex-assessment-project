import React, { Fragment } from 'react';
import { Modal } from 'react-bootstrap';

export default function EditModal({
  editModalShow,
  setEditModalShow,
  title,
  ...props
}) {
  return (
    <Fragment>
      <Modal
        show={editModalShow}
        onHide={() => setEditModalShow(false)}
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
