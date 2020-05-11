/**
 * @module GenericGFPoly
 * @author nuintun
 * @author Cosmo Wolfe
 * @license https://raw.githubusercontent.com/cozmo/jsQR/master/LICENSE
 */

import { addOrSubtractGF, GenericGF } from './GenericGF';

export class GenericGFPoly {
  private field: GenericGF;
  private coefficients: Uint8ClampedArray;

  constructor(field: GenericGF, coefficients: Uint8ClampedArray) {
    if (coefficients.length === 0) {
      throw 'no coefficients';
    }

    this.field = field;

    const coefficientsLength: number = coefficients.length;

    if (coefficientsLength > 1 && coefficients[0] === 0) {
      // Leading term must be non-zero for anything except the constant polynomial "0"
      let firstNonZero: number = 1;

      while (firstNonZero < coefficientsLength && coefficients[firstNonZero] === 0) {
        firstNonZero++;
      }

      if (firstNonZero === coefficientsLength) {
        this.coefficients = field.zero.coefficients;
      } else {
        this.coefficients = new Uint8ClampedArray(coefficientsLength - firstNonZero);

        for (let i: number = 0; i < this.coefficients.length; i++) {
          this.coefficients[i] = coefficients[firstNonZero + i];
        }
      }
    } else {
      this.coefficients = coefficients;
    }
  }

  public degree(): number {
    return this.coefficients.length - 1;
  }

  public isZero(): boolean {
    return this.coefficients[0] === 0;
  }

  public getCoefficient(degree: number): number {
    return this.coefficients[this.coefficients.length - 1 - degree];
  }

  public addOrSubtract(other: GenericGFPoly): GenericGFPoly {
    if (this.isZero()) {
      return other;
    }

    if (other.isZero()) {
      return this;
    }

    let smallerCoefficients: Uint8ClampedArray = this.coefficients;
    let largerCoefficients: Uint8ClampedArray = other.coefficients;

    if (smallerCoefficients.length > largerCoefficients.length) {
      [smallerCoefficients, largerCoefficients] = [largerCoefficients, smallerCoefficients];
    }

    const sumDiff: Uint8ClampedArray = new Uint8ClampedArray(largerCoefficients.length);
    const lengthDiff: number = largerCoefficients.length - smallerCoefficients.length;

    for (let i: number = 0; i < lengthDiff; i++) {
      sumDiff[i] = largerCoefficients[i];
    }

    for (let i: number = lengthDiff; i < largerCoefficients.length; i++) {
      sumDiff[i] = addOrSubtractGF(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
    }

    return new GenericGFPoly(this.field, sumDiff);
  }

  public multiply(scalar: number): GenericGFPoly {
    if (scalar === 0) {
      return this.field.zero;
    }

    if (scalar === 1) {
      return this;
    }

    const size: number = this.coefficients.length;
    const product: Uint8ClampedArray = new Uint8ClampedArray(size);

    for (let i: number = 0; i < size; i++) {
      product[i] = this.field.multiply(this.coefficients[i], scalar);
    }

    return new GenericGFPoly(this.field, product);
  }

  public multiplyPoly(other: GenericGFPoly): GenericGFPoly {
    if (this.isZero() || other.isZero()) {
      return this.field.zero;
    }

    const aCoefficients: Uint8ClampedArray = this.coefficients;
    const aLength: number = aCoefficients.length;
    const bCoefficients: Uint8ClampedArray = other.coefficients;
    const bLength: number = bCoefficients.length;
    const product: Uint8ClampedArray = new Uint8ClampedArray(aLength + bLength - 1);

    for (let i: number = 0; i < aLength; i++) {
      const aCoeff: number = aCoefficients[i];

      for (let j: number = 0; j < bLength; j++) {
        product[i + j] = addOrSubtractGF(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
      }
    }

    return new GenericGFPoly(this.field, product);
  }

  public multiplyByMonomial(degree: number, coefficient: number): GenericGFPoly {
    if (degree < 0) {
      throw 'invalid degree less than 0';
    }

    if (coefficient === 0) {
      return this.field.zero;
    }

    const size: number = this.coefficients.length;
    const product: Uint8ClampedArray = new Uint8ClampedArray(size + degree);

    for (let i: number = 0; i < size; i++) {
      product[i] = this.field.multiply(this.coefficients[i], coefficient);
    }

    return new GenericGFPoly(this.field, product);
  }

  public evaluateAt(a: number): number {
    let result: number = 0;

    if (a === 0) {
      // Just return the x^0 coefficient
      return this.getCoefficient(0);
    }

    const size: number = this.coefficients.length;

    if (a === 1) {
      // Just the sum of the coefficients
      this.coefficients.forEach(coefficient => {
        result = addOrSubtractGF(result, coefficient);
      });

      return result;
    }

    result = this.coefficients[0];

    for (let i: number = 1; i < size; i++) {
      result = addOrSubtractGF(this.field.multiply(a, result), this.coefficients[i]);
    }

    return result;
  }
}
