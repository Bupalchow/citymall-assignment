import React from 'react';

const InputField = ({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  required = false,
  placeholder = '',
  name
}) => {
  return (
    <div className="mb-6">
      <label 
        htmlFor={id} 
        className="block text-cyber-blue mb-2 font-mono text-sm"
      >
        {`>> ${label}`}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full bg-cyber-darker border border-cyber-blue text-cyber-yellow p-3
                focus:outline-none focus:ring-1 focus:ring-cyber-blue
                placeholder:text-gray-500 font-mono"
      />
      <div className="h-0.5 w-full bg-gradient-to-r from-cyber-purple to-transparent mt-1 opacity-50"></div>
    </div>
  );
};

export default InputField;
