import React from "react";
import { Autocomplete, TextField } from "@mui/material";

const ChipsInput = ({
  label,
  helperText,
  value = [],
  onChange,
  ...rest
}) => {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={value}
      onChange={(event, newValue) => {
        if (onChange) onChange(newValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          helperText={helperText}
          variant="outlined"
        />
      )}
      {...rest}
    />
  );
};

export default ChipsInput;

