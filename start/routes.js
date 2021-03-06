'use strict';

const Route = use('Route');

Route.post('users', 'UserController.store');
Route.post('session', 'SessionController.store');
Route.post('passwords', 'ForgotPasswordController.store');
Route.put('passwords', 'ForgotPasswordController.update');

Route.get('files/:id', 'FileController.show');
Route.post('files', 'FileController.store');
