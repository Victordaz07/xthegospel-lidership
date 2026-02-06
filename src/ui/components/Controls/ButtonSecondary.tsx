/**
 * ButtonSecondary - Convenience wrapper for secondary variant Button
 * 
 * @deprecated Consider using <Button variant="secondary"> directly
 * 
 * @example
 * <ButtonSecondary onClick={handleCancel}>Cancel</ButtonSecondary>
 */

import React, { forwardRef } from 'react';
import { Button, ButtonProps } from './Button';

export type ButtonSecondaryProps = Omit<ButtonProps, 'variant'>;

export const ButtonSecondary = forwardRef<HTMLButtonElement, ButtonSecondaryProps>((props, ref) => (
  <Button ref={ref} variant="secondary" {...props} />
));

ButtonSecondary.displayName = 'ButtonSecondary';
