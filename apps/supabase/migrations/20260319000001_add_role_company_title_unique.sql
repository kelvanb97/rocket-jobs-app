create unique index idx_role_company_id_title
  on app.role (company_id, title)
  nulls not distinct;
