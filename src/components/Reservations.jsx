import React from "react";
import { connect } from "react-redux";
import { reduxForm, FieldArray, Form } from "redux-form";
import { Button, Container, Row, Col } from "reactstrap";
import _map from "lodash/map";
import _ from "lodash";
import ReactJson from "react-json-view";
import moment from "moment";

import { WEEK_DAYS } from "../common/constants";
import { clearReservations, saveReservations } from "../actions/machine";
import SingleDayReservations from "./SingleDayReservations";
import "./Reservations.scss";

const validate = values => {
  let errors = {};

  WEEK_DAYS.forEach(day => {
    let dayArray = values[day];
    let errArr = [];
    dayArray.forEach((singleTask, index) => {
      let start = moment(singleTask.start);
      let end = moment(singleTask.end);
      let allowToSecondStep = true;
      if (!singleTask.start) {
        errArr[index] = { ...errArr[index], start: "Can not be empty'" };
        allowToSecondStep = false;
      }
      if (!singleTask.end) {
        errArr[index] = { ...errArr[index], end: "Can not be empty'" };
        allowToSecondStep = false;
      }
      if (moment(start).isAfter(end)) {
        errArr[index] = {
          ...errArr[index],
          end: "End time should be after start time"
        };
        allowToSecondStep = false;
      }
      let moment150minutes = moment(start).add(150, "minutes");
      if (moment(moment150minutes).isSameOrBefore(end)) {
        errArr[index] = {
          ...errArr[index],
          end: "Reservation too long"
        };
        allowToSecondStep = false;
      }
      if (allowToSecondStep) {
        _.reduce(dayArray, function(isColliding, start, end) {}, true);
      } else {
        console.log("second step not allowed");
      }
      errors[day] = errArr;
    });
  });
  return errors;
};

const Reservations = ({
  clearReservations,
  handleSubmit,
  machine,
  saveReservations
}) => (
  <Container className="reservations">
    <Form onSubmit={handleSubmit(saveReservations)}>
      <Row>
        <Col xs={8}>
          <h2>Reservations</h2>
          {_map(WEEK_DAYS, day => (
            <FieldArray
              key={`single-${day}`}
              component={SingleDayReservations}
              name={day}
            />
          ))}
          <Button color="primary" type="submit">
            Save data
          </Button>
        </Col>
        <Col xs={4}>
          <ReactJson src={machine} name="machineStoreState" />
          <Button
            onClick={clearReservations}
            color="warning"
            className="reservations__clear-btn"
          >
            Reset Data
          </Button>
        </Col>
      </Row>
    </Form>
  </Container>
);

const mapStateToProps = state => ({
  machine: state.machine,
  initialValues: state.machine
});

const mapDispatchToProps = {
  clearReservations,
  saveReservations
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  reduxForm({
    form: "reservations",
    validate,
    enableReinitialize: true
  })(Reservations)
);
