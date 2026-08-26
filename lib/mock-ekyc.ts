export type MockEkycProfile = {
  name: string;
  dob: string;
  address: string;
};

export function getMockEkycProfile(): MockEkycProfile {
  return {
    name: "Kavya Menon",
    dob: "1995-08-21",
    address: "HSR Layout, Bengaluru, Karnataka",
  };
}
