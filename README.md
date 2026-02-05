
# Hackerz GatePass

A modern, feature-rich learning management system built with **Next.js 14**, **Shadcn/ui**, **Tailwind CSS**, **TypeScript**, and **Zustand**. This CMS portal provides an intuitive interface for managing courses, students, and educational content. With responsive design and clean UI, it offers a seamless experience for administrators and learners.

---

## Features

- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Modern UI Components**: Built using `shadcn/ui` for reusable and elegant components.
- **TypeScript Integration**: Ensures type safety throughout the application.
- **State Management**: Powered by `Zustand` for scalable and efficient state handling.
- **Utility-First Styling**: Styled with `Tailwind CSS` for rapid design iteration.

---

## Tech/Framework Used

- **Next.js 14**
- **Shadcn/ui**
- **Tailwind CSS**
- **TypeScript**
- **Zustand**

---

## Starting the Project Locally

Follow these steps to get the project running on your local machine:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/shmcglobal/Hackerz-cms-portal.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd Hackerz-cms-portal
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Folder Structure

Below is a simplified folder structure of the project:

```
Hackerz-cms-portal/
├── public/
├── src/
│   ├── components/
│   │   └── admin-panel/
│   │       ├── admin-panel-layout.tsx
│   │       ├── content-layout.tsx
│   ├── app/
│   │   ├── dashboard/
│   │   └── index.tsx
│   ├── styles/
│   ├── utils/
│   ├── hooks/
│   └── store/   # Zustand store
├── .env.local   # Environment variables
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

### Usage Example for Next.js

Here’s an example of setting up the layout and a sample page:

```tsx
// layout.tsx
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}

// page.tsx
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function Page() {
  return (
    <ContentLayout title="Test">
      <div>Test</div>
    </ContentLayout>
  );
}
```

---

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b my-feature-branch
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your fork:
   ```bash
   git push origin my-feature-branch
   ```
5. Submit a pull request.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

## Contact

For any questions, issues, or feedback, feel free to reach out:
# Hackerz-cms-portal
