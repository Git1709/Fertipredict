// backend/src/lib/ols.js
// Improved OLS regression with ridge regularization
function transpose(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function multiply(A, B) {
  const result = Array(A.length)
    .fill(0)
    .map(() => Array(B[0].length).fill(0));

  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      for (let k = 0; k < B.length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

function multiplyVec(A, vec) {
  // A is (m×n), vec is (n)
  return A.map(row => row.reduce((sum, val, j) => sum + val * vec[j], 0));
}

function inverse(matrix) {
  const n = matrix.length;
  const identity = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  const augmented = matrix.map((row, i) => row.concat(identity[i]));

  // Gauss–Jordan elimination
  for (let i = 0; i < n; i++) {
    let diag = augmented[i][i];
    if (Math.abs(diag) < 1e-12) {
      // find non-zero row below
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(augmented[j][i]) > 1e-12) {
          [augmented[i], augmented[j]] = [augmented[j], augmented[i]];
          diag = augmented[i][i];
          break;
        }
      }
    }

    if (Math.abs(diag) < 1e-12) throw new Error("Matrix not invertible");

    for (let j = 0; j < 2 * n; j++) augmented[i][j] /= diag;

    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = augmented[k][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  return augmented.map(row => row.slice(n));
}

function fitOLS(X, y) {
  // Add intercept term (column of ones)
  const XWithIntercept = X.map(row => [1, ...row]);
  const XT = transpose(XWithIntercept);
  const XTX = multiply(XT, XWithIntercept);

  // Ridge regularization for numerical stability
  for (let i = 0; i < XTX.length; i++) {
    XTX[i][i] += 1e-6;
  }

  const XTy = multiplyVec(XT, y);
  const XTXInv = inverse(XTX);
  const coefficients = multiplyVec(XTXInv, XTy);

  return coefficients;
}

function predict(coefficients, features) {
  // coefficients[0] is intercept, then feature coefficients
  let yhat = coefficients[0]; // intercept
  for (let i = 0; i < features.length; i++) {
    yhat += coefficients[i + 1] * features[i];
  }
  return yhat;
}

module.exports = { fitOLS, predict };