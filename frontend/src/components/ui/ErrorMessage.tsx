export default function ErrorMessage({ message = 'Noe gikk galt.' }: { message?: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded my-4">
      {message}
    </div>
  )
}
