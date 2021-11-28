import { TestBed } from '@angular/core/testing';

import { ContractConnectionService } from './contract-connection.service';

describe('ContractConnectionService', () => {
  let service: ContractConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
