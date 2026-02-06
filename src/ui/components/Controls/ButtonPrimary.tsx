/**
 * ButtonPrimary - Convenience wrapper for primary variant Button
 * 
 * @deprecated Consider using <Button variant="primary"> directly
 * 
 * @example
 * <ButtonPrimary onClick={handleSubmit}>Submit</ButtonPrimary>
 */

import React, { forwardRef } from 'react';
import { Button, ButtonProps } from './Button';

export type ButtonPrimaryProps = Omit<ButtonProps, 'variant'>;

export const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>((props, ref) => (
  <Button ref={ref} variant="primary" {...props} />
));

ButtonPrimary.displayName = 'ButtonPrimary';
