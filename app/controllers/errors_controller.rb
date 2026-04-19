class ErrorsController < ApplicationController
  def not_found
    render inertia: "ErrorPage", props: {
      status: 404,
      title: "Page not found",
      message: "The page you're looking for doesn't exist or has been moved."
    }, status: :not_found
  end

  def unprocessable
    render inertia: "ErrorPage", props: {
      status: 422,
      title: "Request could not be processed",
      message: "Something about the request was invalid. Please go back and try again."
    }, status: :unprocessable_entity
  end

  def server_error
    render inertia: "ErrorPage", props: {
      status: 500,
      title: "Something went wrong",
      message: "An unexpected error occurred on our end. Please try again or contact support if the issue persists."
    }, status: :internal_server_error
  end
end
